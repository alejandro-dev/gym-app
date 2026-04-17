import {
   ConflictException,
   Injectable,
   UnauthorizedException,
   BadRequestException,
   Logger,
   ForbiddenException,
} from '@nestjs/common';
import { scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokenPayload } from './interfaces/auth-token-payload.interface';
import { hashValue } from './utils/hash-value.utils';
import { AccountOnboardingService } from './account-onboarding.service';
import type { AuthResult } from './types/auth-result.type';

// Convertimos scrypt de la librería crypto de Node desde formato callback a formato async/await.
const scrypt = promisify(scryptCallback);

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
      private readonly configService: ConfigService,
      private readonly jwtService: JwtService,
      private readonly prisma: PrismaService,
      private readonly accountOnboardingService: AccountOnboardingService,
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
      isActive: true,
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
      const passwordHash = await hashValue(registerDto.password);
      const {
         emailVerificationToken,
         emailVerificationTokenHash,
         emailVerificationExpiresAt,
      } =
         await this.accountOnboardingService.createEmailVerificationArtifacts();

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
         const authResult =
            await this.accountOnboardingService.issueTokens(user);
         await this.accountOnboardingService.enqueueWelcomeEmail({
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            emailVerificationToken,
         });

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
    * @throws ForbiddenException si el usuario no ha verificado su email
    */
   async login(loginDto: LoginDto): Promise<AuthResult> {
      // Consutamos el usuario
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
            isActive: true,
            createdAt: true,
            updatedAt: true,
            emailVerifiedAt: true,
         },
      });

      // Si no existe el usuario, lanza una excepción
      if (!user) throw new UnauthorizedException('Invalid credentials');

      // Si el usuario no está activo, lanza una excepción
      if (!user.isActive) throw new ForbiddenException('User not active');

      // Verificamos la contraseña
      const isPasswordValid = await this.verifyValue(
         loginDto.password,
         user.passwordHash,
      );

      // Si la contraseña no es válida, lanza una excepción
      if (!isPasswordValid)
         throw new UnauthorizedException('Invalid credentials');

      // Verificamos si el usuario ha verificado su email
      if (!user.emailVerifiedAt)
         throw new ForbiddenException('Email not verified');

      // Devolvemos el perfil público del usuario
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

      return this.accountOnboardingService.issueTokens(publicUser);
   }

   /**
    * Devuelve el perfil publico del usuario autenticado.
    *
    * @param userId - Identificador del usuario autenticado
    * @returns Perfil publico del usuario autenticado
    * @throws UnauthorizedException si el usuario no existe
    */
   async getProfile(userId: string) {
      // Consutamos el usuario
      const user = await this.prisma.user.findUnique({
         where: { id: userId },
         select: this.publicUserSelect,
      });

      // Si no existe el usuario, lanza una excepción
      if (!user) throw new UnauthorizedException('User not found');

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
      // Verificamos que se reciba un refresh token
      if (!refreshToken)
         throw new BadRequestException('Refresh token is required');

      // Verificamos el token
      const payload = await this.verifyToken(
         refreshToken,
         this.getRefreshTokenSecret(),
      );

      // Si el token no es de tipo refresh, lanza una excepción
      if (payload.tokenType !== 'refresh')
         throw new UnauthorizedException('Invalid refresh token');

      // Consutamos el usuario
      const user = await this.prisma.user.findUnique({
         where: { id: payload.sub },
         select: {
            ...this.publicUserSelect,
            hashedRefreshToken: true,
         },
      });

      // Si no existe el usuario, lanza una excepción
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      // Si el usuario no está activo, lanza una excepción
      if (!user.isActive) throw new ForbiddenException('User not active');

      // Si no existe el usuario o el refresh token no está disponible, lanza una excepción
      if (!user?.hashedRefreshToken)
         throw new UnauthorizedException('Refresh token not available');

      // Verificamos el refresh token
      const isRefreshTokenValid = await this.verifyValue(
         refreshToken,
         user.hashedRefreshToken,
      );

      // Si el refresh token no es válido, lanza una excepción
      if (!isRefreshTokenValid)
         throw new UnauthorizedException('Invalid refresh token');

      // Devolvemos el perfil público del usuario
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
      return this.accountOnboardingService.issueTokens(publicUser);
   }

   /**
    * Elimina el refresh token almacenado del usuario.
    *
    * @param userId - Identificador del usuario autenticado
    * @returns Confirmacion de cierre de sesion
    */
   async logout(userId: string) {
      // Actualizamos el usuario
      await this.prisma.user.update({
         where: { id: userId },
         data: { hashedRefreshToken: null },
      });

      return { message: 'Logged out successfully' };
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

      // Consutamos los usuarios
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

      // Recorremos los usuarios
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
    * Verifica un valor plano frente a su hash almacenado.
    *
    * @param value - Valor plano a comprobar
    * @param storedHash - Hash almacenado con salt
    * @returns `true` si el valor coincide con el hash almacenado
    */
   private async verifyValue(value: string, storedHash: string) {
      // Separamos el salt y el hash almacenado
      const [salt, storedKey] = storedHash.split(':');

      // Si no hay salt o hash almacenado, no se puede verificar
      if (!salt || !storedKey) return false;

      // Calculamos el hash con el salt
      const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
      const storedKeyBuffer = Buffer.from(storedKey, 'hex');

      // Si el tamaño de la clave derivada no es igual al tamaño del hash almacenado, no se puede verificar
      if (derivedKey.length !== storedKeyBuffer.length) return false;

      // Verificamos si los hashes son iguales
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
}
