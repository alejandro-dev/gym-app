import type { User } from '@gym-app/types';
import { apiFetch } from '@/services/api/client';

export type UpdateMyProfilePayload = {
   firstName?: string | null;
   lastName?: string | null;
   weightKg?: number | null;
   heightCm?: number | null;
   birthDate?: string | null;
};

// Función para obtener el perfil del usuario autenticado
export function getMyProfile() {
   return apiFetch<User>('/api/auth/me');
}

// Función para actualizar el perfil del usuario autenticado
export function updateMyProfile(payload: UpdateMyProfilePayload) {
   return apiFetch<User>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
   });
}

// Función para cerrar sesión del usuario autenticado
export function logout() {
   return apiFetch<User>('/api/auth/logout', {
      method: 'POST',
   });
}