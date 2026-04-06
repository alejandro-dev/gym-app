import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountOnboardingService } from './account-onboarding.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RolesGuard } from './guards/roles.guard';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

/**
 * Modulo de autenticacion.
 * Agrupa controladores, servicios y estrategia JWT para acceso y refresh tokens.
 */
@Module({
   imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({}),
   ],
   controllers: [AuthController],
   providers: [
      AuthService,
      AccountOnboardingService,
      AccessTokenStrategy,
      AccessTokenGuard,
      RolesGuard,
   ],
   exports: [AuthService, AccountOnboardingService],
})
export class AuthModule {}
