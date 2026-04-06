import { randomInt } from 'node:crypto';

// Evitamos caracteres ambiguos como O/0 e I/l para que la password temporal
// sea más fácil de leer o comunicar si hace falta.
const PASSWORD_ALPHABET =
   'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

const DEFAULT_PASSWORD_LENGTH = 12;

/**
 * Genera una password aleatoria con entropía suficiente para uso temporal.
 *
 * @param length - Longitud deseada de la password
 * @returns Password aleatoria segura
 */
export function generateRandomPassword(length = DEFAULT_PASSWORD_LENGTH) {
   if (!Number.isInteger(length) || length < 12) {
      throw new Error(
         'Password length must be an integer greater than or equal to 12',
      );
   }

   let password = '';

   for (let index = 0; index < length; index += 1) {
      const randomIndex = randomInt(0, PASSWORD_ALPHABET.length);
      password += PASSWORD_ALPHABET[randomIndex];
   }

   return password;
}
