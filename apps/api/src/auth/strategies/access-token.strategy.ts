import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
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
   constructor(
      configService: ConfigService,
      private readonly prisma: PrismaService,
   ) {
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
   async validate(payload: AuthTokenPayload): Promise<AuthenticatedUser> {
      // Si el token no es de tipo access, lanza una excepción
      if (payload.tokenType !== 'access') {
         throw new UnauthorizedException('Invalid access token');
      }

      // Consutamos el usuario
      const user = await this.prisma.user.findUnique({
         where: { id: payload.sub },
         select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
         },
      });

      // Si no existe el usuario o el token no está activo, lanza una excepción
      if (!user || !user.isActive) {
         throw new UnauthorizedException('Invalid access token');
      }

      // Devolvemos el perfil público del usuario
      return {
         sub: user.id,
         email: user.email,
         role: user.role,
         tokenType: 'access',
      };
   }
}
