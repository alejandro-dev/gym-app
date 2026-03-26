import { UserRole } from '@prisma/client';

/**
 * Payload comun incluido en los JWT emitidos por el sistema.
 */
export interface AuthTokenPayload {
   /** Identificador del usuario autenticado. */
   sub: string;

   /** Email del usuario en el momento de emitir el token. */
   email: string;

   /** Rol del usuario para posibles comprobaciones de autorizacion. */
   role: UserRole;

   /** Tipo de token emitido para distinguir access y refresh. */
   tokenType: 'access' | 'refresh';
}
