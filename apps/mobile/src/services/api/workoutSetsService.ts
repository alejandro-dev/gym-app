import { WorkoutSet } from "@gym-app/types";
import { apiFetch } from "./client";

export type CreateWorkoutSetPayload = {
   workoutSessionId: string;
   exerciseId: string;
   setNumber: number;
   reps?: number | null;
   weightKg?: number | null;
   durationSeconds?: number | null;
   distanceMeters?: number | null;
   rir?: number | null;
   isWarmup?: boolean;
   isCompleted?: boolean;
};

// Crear una serie de una rutina
export function createWorkoutSet(payload: CreateWorkoutSetPayload) {
   return apiFetch<WorkoutSet>('/api/workout-sets', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}

// Eliminar una serie de una rutina
export function deleteWorkoutSet(id: string) {
   return apiFetch<WorkoutSet>(`/api/workout-sets/${id}`, {
      method: 'DELETE',
   });
}
