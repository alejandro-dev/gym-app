import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProducer } from '../bullmq/auth/auth.producer';
import { hashValue } from './utils/hash-value.utils';
import { generateEmailVerificationToken } from './utils/generate-email-verification-token.util';
import { AuthTokenPayload } from './interfaces/auth-token-payload.interface';
import type { AuthResult, AuthResultUser } from './types/auth-result.type';

type EmailVerificationArtifacts = {
   emailVerificationToken: string;
   emailVerificationTokenHash: string;
   emailVerificationExpiresAt: Date;
};

type WelcomeEmailData = {
   userId: string;
   email: string;
   firstName: string | null;
   emailVerificationToken?: string;
   temporaryPassword?: string;
};

/**
 * Servicio compartido para el onboarding de cuentas.
 * Centraliza la emisión de tokens, artefactos de verificación de email
 * y el encolado de correos de bienvenida.
 */
@Injectable()
export class AccountOnboardingService {
   private readonly logger = new Logger(AccountOnboardingService.name);

   /**
    * Crea una nueva instancia del servicio de onboarding.
    *
    * @param prisma - Cliente de Prisma compartido
    * @param jwtService - Servicio de firma de JWT
    * @param configService - Servicio de configuración
    * @param authProducer - Producer de BullMQ para emails de onboarding
    */
   constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly authProducer: AuthProducer,
   ) {}

   /**
    * Genera el token de verificación de email junto con su hash y expiración.
    *
    * @returns Artefactos necesarios para persistir y enviar el token
    */
   async createEmailVerificationArtifacts(): Promise<EmailVerificationArtifacts> {
      const emailVerificationToken = generateEmailVerificationToken();
      const emailVerificationTokenHash = await hashValue(
         emailVerificationToken,
      );
      const ttlSeconds = this.configService.get<number>(
         'EMAIL_VERIFICATION_TTL_SECONDS',
         60 * 60 * 24,
      );

      return {
         emailVerificationToken,
         emailVerificationTokenHash,
         emailVerificationExpiresAt: new Date(Date.now() + ttlSeconds * 1000),
      };
   }

   /**
    * Emite access y refresh token y persiste el hash del refresh token.
    *
    * @param user - Usuario autenticado o recién creado
    * @returns Par de tokens junto con el usuario público
    */
   async issueTokens(user: AuthResultUser): Promise<AuthResult> {
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
            hashedRefreshToken: await hashValue(refreshToken),
         },
      });

      return {
         user,
         accessToken,
         refreshToken,
      };
   }

   /**
    * Encola el correo de bienvenida/verificación para el usuario.
    *
    * @param data - Datos necesarios para construir el correo de onboarding
    */
   async enqueueWelcomeEmail(data: WelcomeEmailData): Promise<void> {
      try {
         await this.authProducer.enqueueUserRegistered(data);
      } catch (error) {
         this.logger.error(
            `Error encolando onboarding para ${data.email}`,
            error instanceof Error ? error.stack : undefined,
         );
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
    * Devuelve la duración del access token en segundos.
    *
    * @returns Tiempo de vida del access token
    */
   private getAccessTokenTtlSeconds() {
      return this.configService.get<number>('JWT_ACCESS_TTL_SECONDS', 900);
   }

   /**
    * Devuelve la duración del refresh token en segundos.
    *
    * @returns Tiempo de vida del refresh token
    */
   private getRefreshTokenTtlSeconds() {
      return this.configService.get<number>('JWT_REFRESH_TTL_SECONDS', 604800);
   }
}
