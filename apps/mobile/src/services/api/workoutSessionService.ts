import { WorkoutSession } from "@gym-app/types";
import { apiFetch } from "./client";

export type CreateWorkoutSessionPayload = {
   userId: string;
   name: string;
   notes: string | null;
   startedAt: string;
   endedAt: string | null;
   workoutPlanId: string | null;
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
