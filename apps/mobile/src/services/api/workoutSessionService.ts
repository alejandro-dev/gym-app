import { WorkoutSession, WorkoutSessionFeedListResponse } from "@gym-app/types";
import { apiFetch } from "./client";

export type CreateWorkoutSessionPayload = {
   userId: string;
   name: string;
   notes: string | null;
   startedAt: string;
   endedAt: string | null;
   workoutPlanId: string | null;
};

export type SearchWorkoutSessionsParams = {
   page?: number;
   limit?: number;
   userId?: string;
};

// Crear una sesión de entrenamiento de una rutina
export function createWorkoutSession(payload: CreateWorkoutSessionPayload) {
   return apiFetch<WorkoutSession>('/api/workout-sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}

// Eliminar una sesión de entrenamiento de una rutina
export function deleteWorkoutSession(id: string) {
   return apiFetch<WorkoutSession>(`/api/workout-sessions/${id}`, {
      method: 'DELETE',
   });
}

// Completar una sesión de entrenamiento de una rutina
export function completeWorkoutSession(id: string) {
   return apiFetch<WorkoutSession>(`/api/workout-sessions/${id}/complete`, {
      method: 'POST',
   });
}

// Creamos la ruta de búsqueda de sesiones de entrenamiento completadas
export function buildCompletedWorkoutSessionsPath({
   page = 0,
   limit = 10,
   userId,
}: SearchWorkoutSessionsParams = {}) {
   const params = new URLSearchParams();

   params.set('page', String(page));
   params.set('limit', String(limit));
   if (userId) {
      params.set('userId', userId);
   }

   return `/api/workout-sessions/completed?${params.toString()}`;
}

// Obtenemos las sesiones de entrenamiento completadas
export function getCompletedWorkoutSessions(
   params?: SearchWorkoutSessionsParams,
) {
   return apiFetch<WorkoutSessionFeedListResponse>(
      buildCompletedWorkoutSessionsPath(params),
   );
}
