import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProducer } from '../bullmq/auth/auth.producer';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokenPayload } from './interfaces/auth-token-payload.interface';

// Convertimos scrypt de la librería crypto de Node desde formato callback a formato async/await.
const scrypt = promisify(scryptCallback);

// Define el tipo de resultado de la autenticación
type AuthResult = {
  user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    weightKg: number | null;
    heightCm: number | null;
    birthDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
};

/**
 * Servicio de autenticacion con access token y refresh token.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Crea una nueva instancia del servicio de autenticación.
   *
   * @param prisma - Cliente de Prisma compartido por la aplicación
   * @param jwtService - Servicio de generación de tokens JWT
   * @param configService - Servicio de configuración
   * @param authProducer - Producer de BullMQ para el envio de mensajes de verificación de email
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authProducer: AuthProducer,
  ) {}

  /**
   * Seleccion publica de campos del usuario.
   * Excluye datos sensibles como hashes de password o refresh token.
   */
  private readonly publicUserSelect = {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    role: true,
    weightKg: true,
    heightCm: true,
    birthDate: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  /**
   * Registra un usuario nuevo con rol USER y emite sus tokens.
   *
   * @param registerDto - Datos de registro del usuario
   * @returns Usuario registrado junto con access token y refresh token
   * @throws ConflictException si el email o username ya existen
   */
  async register(registerDto: RegisterDto): Promise<AuthResult> {
    // Hasheamos el password y el token de verificacion de email
    const passwordHash = await this.hashValue(registerDto.password);
    const emailVerificationToken = this.generateEmailVerificationToken();
    const emailVerificationTokenHash = await this.hashValue(
      emailVerificationToken,
    );

    // Calculamos la fecha de expiracion del token de verificacion de email
    const emailVerificationExpiresAt = this.buildEmailVerificationExpiresAt();

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: UserRole.USER,
          weightKg: registerDto.weightKg,
          heightCm: registerDto.heightCm,
          birthDate: registerDto.birthDate
            ? new Date(registerDto.birthDate)
            : undefined,
          emailVerificationTokenHash,
          emailVerificationExpiresAt,
        },
        select: this.publicUserSelect,
      });

      // Generamos el token de verificación de email
      const authResult = await this.issueTokens(user);

      try {
        // Enviamos un mensaje de verificación de email a la cola
        await this.authProducer.enqueueUserRegistered({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          emailVerificationToken,
        });
      } catch (error) {
        // Capturamos cualquier error y lo reportamos
        this.logger.error(
          `Error encolando verificacion de email para ${user.email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      return authResult;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or username already exists');
      }

      throw error;
    }
  }

  /**
   * Valida credenciales y devuelve un par nuevo de tokens.
   *
   * @param loginDto - Credenciales de acceso
   * @returns Usuario autenticado junto con access token y refresh token
   * @throws UnauthorizedException si las credenciales no son validas
   */
  async login(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        weightKg: true,
        heightCm: true,
        birthDate: true,
        hashedRefreshToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyValue(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const publicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return this.issueTokens(publicUser);
  }

  /**
   * Devuelve el perfil publico del usuario autenticado.
   *
   * @param userId - Identificador del usuario autenticado
   * @returns Perfil publico del usuario autenticado
   * @throws UnauthorizedException si el usuario no existe
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.publicUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Rota el refresh token y devuelve un nuevo par de tokens.
   *
   * @param refreshToken - Refresh token actual
   * @returns Usuario autenticado junto con un nuevo access token y refresh token
   * @throws BadRequestException si no se recibe refresh token
   * @throws UnauthorizedException si el token no es valido o no coincide con el almacenado
   */
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const payload = await this.verifyToken(
      refreshToken,
      this.getRefreshTokenSecret(),
    );

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        ...this.publicUserSelect,
        hashedRefreshToken: true,
      },
    });

    if (!user?.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token not available');
    }

    const isRefreshTokenValid = await this.verifyValue(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const publicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return this.issueTokens(publicUser);
  }

  /**
   * Elimina el refresh token almacenado del usuario.
   *
   * @param userId - Identificador del usuario autenticado
   * @returns Confirmacion de cierre de sesion
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Emite access y refresh token y persiste el refresh token hasheado.
   *
   * @param user - Usuario para el que se emiten los tokens
   * @returns Usuario junto con access token y refresh token
   */
  private async issueTokens(user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    weightKg: number | null;
    heightCm: number | null;
    birthDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<AuthResult> {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    const refreshPayload: AuthTokenPayload = {
      ...payload,
      tokenType: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: `${this.getAccessTokenTtlSeconds()}s`,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRefreshTokenSecret(),
        expiresIn: `${this.getRefreshTokenTtlSeconds()}s`,
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedRefreshToken: await this.hashValue(refreshToken),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verifica el token de verificación de email.
   *
   * @param token - Token de verificación de email
   * @returns Datos del usuario verificado
   */
  async verifyEmail(token: string) {
    // Comprobamos que el token existe
    if (!token)
      throw new BadRequestException(
        'Token de verificación de email no proporcionado',
      );

    const users = await this.prisma.user.findMany({
      where: {
        emailVerifiedAt: null,
        emailVerificationExpiresAt: { gt: new Date() },
        emailVerificationTokenHash: { not: null },
      },
      select: { id: true, emailVerificationTokenHash: true },
    });

    // Buscamos el usuario que coincida con el token
    let matchingUserId: string | null = null;

    for (const user of users) {
      // Si no hay token de verificación, no lo consideramos
      if (!user.emailVerificationTokenHash) continue;

      // Comprobamos si el token coincide
      const isMatch = await this.verifyValue(
        token,
        user.emailVerificationTokenHash,
      );

      // Si coincide, guardamos el id del usuario
      if (isMatch) {
        matchingUserId = user.id;

        // Borramos el token de verificación, ya que ya lo hemos verificado y guardamos la fecha de verificación
        await this.prisma.user.update({
          where: { id: matchingUserId },
          data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
          },
        });

        return { message: 'Email verified successfully' };
      }
    }

    // Si no coincide, lanza una excepción
    throw new UnauthorizedException('Invalid or expired verification token');
  }

  /**
   * Hash seguro para passwords y refresh tokens.
   *
   * @param value - Valor plano a hashear
   * @returns Hash derivado con salt
   */
  private async hashValue(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Genera un token de verificacion de email.
   *
   * @returns Token de verificacion de email
   */
  private generateEmailVerificationToken() {
    return randomBytes(32).toString('hex');
  }

  /**
   * Genera la fecha de expiracion de un token de verificacion de email.
   *
   * @returns Fecha de expiracion de un token de verificacion de email
   */
  private buildEmailVerificationExpiresAt() {
    const ttlSeconds = this.configService.get<number>(
      'EMAIL_VERIFICATION_TTL_SECONDS',
      60 * 60 * 24,
    );

    return new Date(Date.now() + ttlSeconds * 1000);
  }

  /**
   * Verifica un valor plano frente a su hash almacenado.
   *
   * @param value - Valor plano a comprobar
   * @param storedHash - Hash almacenado con salt
   * @returns `true` si el valor coincide con el hash almacenado
   */
  private async verifyValue(value: string, storedHash: string) {
    const [salt, storedKey] = storedHash.split(':');

    if (!salt || !storedKey) {
      return false;
    }

    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    const storedKeyBuffer = Buffer.from(storedKey, 'hex');

    if (derivedKey.length !== storedKeyBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedKeyBuffer);
  }

  /**
   * Verifica la firma y expiracion de un JWT.
   *
   * @param token - JWT a validar
   * @param secret - Secreto usado para verificar la firma
   * @returns Payload valido del token
   * @throws UnauthorizedException si el token es invalido o ha expirado
   */
  private async verifyToken(token: string, secret: string) {
    try {
      return await this.jwtService.verifyAsync<AuthTokenPayload>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Obtiene el secreto usado para firmar access tokens.
   *
   * @returns Secreto para access tokens
   */
  private getAccessTokenSecret() {
    return this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'dev-access-secret-change-me',
    );
  }

  /**
   * Obtiene el secreto usado para firmar refresh tokens.
   *
   * @returns Secreto para refresh tokens
   */
  private getRefreshTokenSecret() {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'dev-refresh-secret-change-me',
    );
  }

  /**
   * Devuelve la duracion del access token en segundos.
   *
   * @returns Tiempo de vida del access token en segundos
   */
  private getAccessTokenTtlSeconds() {
    return this.configService.get<number>('JWT_ACCESS_TTL_SECONDS', 900);
  }

  /**
   * Devuelve la duracion del refresh token en segundos.
   *
   * @returns Tiempo de vida del refresh token en segundos
   */
  private getRefreshTokenTtlSeconds() {
    return this.configService.get<number>('JWT_REFRESH_TTL_SECONDS', 604800);
  }
}
