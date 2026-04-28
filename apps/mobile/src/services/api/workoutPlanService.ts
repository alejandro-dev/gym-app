import type { WorkoutPlansListResponse } from '@gym-app/types';

import { apiFetch } from '@/services/api/client';

// Parametros de búsqueda para las rutinas
export type SearchWorkoutPlansParams = {
   page?: number;
   limit?: number;
};

// Ruta de búsqueda de rutinas
export function buildWorkoutPlansPath({
   page = 0,
   limit = 10,
}: SearchWorkoutPlansParams = {}) {
   const params = new URLSearchParams();

   // Parametros de paginación
   params.set('page', String(page));
   params.set('limit', String(limit));

   return `/api/workout-plans?${params.toString()}`;
}

// Consulta de rutinas
export function getWorkoutPlans(params?: SearchWorkoutPlansParams) {
   return apiFetch<WorkoutPlansListResponse>(buildWorkoutPlansPath(params));
}
