import Constants from 'expo-constants';
import { router } from 'expo-router';

import { getAccessToken, removeAccessToken } from '@/services/storage/secure-storage';

// Tipo que representa un error de la API
type ApiErrorPayload = {
   message?: string | string[];
   error?: string;
   statusCode?: number;
};

// Clase que representa un error de la API
export class ApiError extends Error {
   status: number;

   constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
   }
}

// Obtiene la URL base de la API
export function getApiBaseUrl() {
   const apiUrl =
      process.env.EXPO_PUBLIC_API_URL ??
      (Constants.expoConfig?.extra?.apiUrl as string | undefined);

   if (!apiUrl) {
      throw new Error('Missing API URL. Define EXPO_PUBLIC_API_URL for the mobile app.');
   }

   return apiUrl.replace(/\/$/, '');
}

// Construye una URL absoluta contra la API, conservando URLs externas.
export function buildApiUrl(pathOrUrl: string) {
   if (/^https?:\/\//i.test(pathOrUrl)) {
      return pathOrUrl;
   }

   return `${getApiBaseUrl()}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

// Obtiene el mensaje de error de la API
function getErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
   if (Array.isArray(payload?.message)) {
      return payload.message[0] ?? fallback;
   }

   if (typeof payload?.message === 'string') {
      return payload.message;
   }

   if (typeof payload?.error === 'string') {
      return payload.error;
   }

   return fallback;
}

function isAuthEndpoint(path: string) {
   return path.includes('/api/auth/login') || path.includes('/api/auth/register');
}

async function handleAuthorizationError(path: string, status: number) {
   if ((status !== 401 && status !== 403) || isAuthEndpoint(path)) {
      return;
   }

   await removeAccessToken();
   router.replace('/login');
}

// Envía una petición a la API y devuelve el resultado
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
   const accessToken = await getAccessToken();

   const response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
         'Content-Type': 'application/json',
         ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
         ...(init?.headers ?? {}),
      },
   });

   const payload = await response.json().catch(() => null);

   if (!response.ok) {
      await handleAuthorizationError(path, response.status);

      throw new ApiError(
         getErrorMessage(payload, 'Unexpected error'),
         response.status,
      );
   }

   return payload as T;
}
