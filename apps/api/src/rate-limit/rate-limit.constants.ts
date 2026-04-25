/**
 * Politica v1 para autenticación pública.
 */
export const AUTH_PUBLIC_RATE_LIMITS = {
   register: {
      default: {
         limit: 3,
         ttl: 60 * 60 * 1000,
      },
   },
   login: {
      default: {
         limit: 5,
         ttl: 15 * 60 * 1000,
      },
   },
   refresh: {
      default: {
         limit: 20,
         ttl: 5 * 60 * 1000,
      },
   },
   verifyEmail: {
      default: {
         limit: 10,
         ttl: 60 * 60 * 1000,
      },
   },
} as const;

/**
 * Politica base v1 para endpoints autenticados de escritura.
 * Busca frenar ráfagas y abuso sin castigar el uso normal de la app.
 * Limite de 20 peticiones por 60 segundos.
 */
export const WRITE_ENDPOINT_RATE_LIMIT = {
   default: {
      limit: 20,
      ttl: 60_000,
   },
} as const;

/**
 * Politica más estricta para endpoints costosos como subida de archivos.
 * Limite de 5 peticiones por 15 minutos.
 */
export const COSTLY_UPLOAD_RATE_LIMIT = {
   default: {
      limit: 5,
      ttl: 15 * 60 * 1000,
   },
} as const;
