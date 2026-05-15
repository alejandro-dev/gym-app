import { randomBytes } from 'node:crypto';

/**
 * Genera un token aleatorio para verificar el e-mail del usuario.
 *
 * @returns Token de verificación en formato hexadecimal
 */
export function generateSecureToken() {
   return randomBytes(32).toString('hex');
}
