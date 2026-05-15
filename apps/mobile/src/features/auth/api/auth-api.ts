import { apiFetch } from '@/services/api/client';

// Tipo que representa los datos necesarios para iniciar sesión
export interface LoginPayload {
   email: string;
   password: string;
}

// Tipo que representa los datos necesarios para registrar un nuevo usuario
export interface RegisterPayload {
   email: string;
   password: string;
   username?: string;
   firstName?: string;
   lastName?: string;
   weightKg?: number;
   heightCm?: number;
   birthDate?: string;
}

// Tipo que representa un usuario autenticado
export interface AuthUser {
   id: string;
   email: string;
   username?: string | null;
   firstName?: string | null;
   lastName?: string | null;
}

// Tipo que representa la respuesta de la API de inicio de sesión
export interface LoginResponse {
   user: AuthUser;
   accessToken: string;
}

// Tipo que representa la respuesta de la API de registro
export interface RegisterResponse {
   user: AuthUser;
   accessToken: string;
}

// Función que realiza la solicitud de inicio de sesión a la API
export function login(payload: LoginPayload) {
   return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}

// Función que registra un nuevo usuario en la API
export function register(payload: RegisterPayload) {
   return apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}
