import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthTokenPayload } from '../interfaces/auth-token-payload.interface';

/**
 * Estrategia para validar el access token enviado en Authorization Bearer.
 */
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
   /**
    * Configura la extraccion y validacion del access token desde cabecera Bearer.
    */
   constructor(configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: configService.get<string>(
            'JWT_ACCESS_SECRET',
            'dev-access-secret-change-me',
         ),
      });
   }

   /**
    * Valida el payload decodificado y construye el usuario autenticado.
    */
   validate(payload: AuthTokenPayload): AuthenticatedUser {
      if (payload.tokenType !== 'access') {
         throw new UnauthorizedException('Invalid access token');
      }

      return {
         sub: payload.sub,
         email: payload.email,
         role: payload.role,
         tokenType: 'access',
      };
   }
}
