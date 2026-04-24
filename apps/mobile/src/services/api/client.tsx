import Constants from 'expo-constants';

import { getAccessToken } from '@/services/storage/secure-storage';

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
function getApiBaseUrl() {
   const apiUrl =
      process.env.EXPO_PUBLIC_API_URL ??
      (Constants.expoConfig?.extra?.apiUrl as string | undefined);

   if (!apiUrl) {
      throw new Error('Missing API URL. Define EXPO_PUBLIC_API_URL for the mobile app.');
   }

   return apiUrl.replace(/\/$/, '');
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

// Envía una petición a la API y devuelve el resultado
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
   const accessToken = await getAccessToken();

   const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
         'Content-Type': 'application/json',
         ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
         ...(init?.headers ?? {}),
      },
   });

   const payload = await response.json().catch(() => null);

   if (!response.ok) {
      throw new ApiError(
         getErrorMessage(payload, 'Unexpected error'),
         response.status,
      );
   }

   return payload as T;
}
