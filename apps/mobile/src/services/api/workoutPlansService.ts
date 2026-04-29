import type { WorkoutPlansListResponse, WorkoutPlan, WorkoutPlanGoal, WorkoutPlanLevel } from '@gym-app/types';

import { apiFetch } from '@/services/api/client';

// Parametros de búsqueda para las rutinas
export type SearchWorkoutPlansParams = {
   page?: number;
   limit?: number;
};

export type CreateWorkoutPlanParams = {
   userId: string;
   name: string;
   description: string | null;
   goal: WorkoutPlanGoal;
   level: WorkoutPlanLevel;
   durationWeeks: number | null;
   isActive: boolean;
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

// Consulta los datos básicos de una sola rutina por id.
export function getWorkoutPlan(id: string) {
   return apiFetch<WorkoutPlan>(`/api/workout-plans/${id}`);
}

// Función para crear una nueva rutina.
export function createWorkoutPlan(payload: CreateWorkoutPlanParams) {
   return apiFetch<WorkoutPlan>('/api/workout-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}

// Función para eliminar una rutina.
export function deleteWorkoutPlan(id: string) {
   return apiFetch<WorkoutPlan>(`/api/workout-plans/${id}`, {
      method: 'DELETE',
   });
}
