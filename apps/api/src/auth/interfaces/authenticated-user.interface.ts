import { UserRole } from '@prisma/client';

/**
 * Usuario autenticado expuesto en `request.user` tras validar el access token.
 */
export interface AuthenticatedUser {
  /** Identificador del usuario autenticado. */
  sub: string;

  /** Email del usuario autenticado. */
  email: string;

  /** Rol actual del usuario autenticado. */
  role: UserRole;

  /** Tipo fijo para access token validado por la estrategia. */
  tokenType: 'access';
}
