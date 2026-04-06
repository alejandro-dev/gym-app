import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';

// Convertimos scrypt de la librería crypto de Node desde formato callback a formato async/await.
const scrypt = promisify(scryptCallback);

/**
 * Hash seguro para passwords y refresh tokens.
 *
 * @param value - Valor plano a hashear
 * @returns Hash derivado con salt
 */
export async function hashValue(value: string): Promise<string> {
   const salt = randomBytes(16).toString('hex');
   const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
   return `${salt}:${derivedKey.toString('hex')}`;
}
