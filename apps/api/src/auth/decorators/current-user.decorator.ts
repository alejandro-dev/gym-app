import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Decorador para acceder al usuario autenticado inyectado por Passport.
 */
export const CurrentUser = createParamDecorator(
   (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
      const request = context.switchToHttp().getRequest<{
         user: AuthenticatedUser;
      }>();
      return request.user;
   },
);
