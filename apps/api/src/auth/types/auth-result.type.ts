import { UserRole } from '@prisma/client';

/**
 * Usuario público que se incluye en respuestas de autenticación.
 */
export type AuthResultUser = {
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

/**
 * Resultado estándar emitido al crear o renovar credenciales.
 */
export type AuthResult = {
   user: AuthResultUser;
   accessToken: string;
   refreshToken: string;
};
