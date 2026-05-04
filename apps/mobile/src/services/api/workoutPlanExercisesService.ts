import type { WorkoutPlanExercise } from '@gym-app/types';

import { apiFetch } from '@/services/api/client';

export type CreateWorkoutPlanExerciseParams = {
   workoutPlanId: string;
   exerciseId: string;
   day: number | null;
   order: number;
   targetSets: number | null;
   targetRepsMin: number | null;
   targetRepsMax: number | null;
   targetWeightKg: number | null;
   restSeconds: number | null;
   notes: string | null;
};

export type UpdateWorkoutPlanExerciseParams = Omit<CreateWorkoutPlanExerciseParams, 'workoutPlanId'>;


// Consulta de ejercicios de una rutina.
export function getWorkoutPlanExercises(workoutPlanId: string) {
   const params = new URLSearchParams();
   params.set('workoutPlanId', workoutPlanId);

   return apiFetch<WorkoutPlanExercise[]>(
      `/api/workout-plan-exercises?${params.toString()}`,
   );
}

// Crea un ejercicio dentro de una rutina.
export function createWorkoutPlanExercise(payload: CreateWorkoutPlanExerciseParams) {
   return apiFetch<WorkoutPlanExercise>('/api/workout-plan-exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
   });
}

// Actualiza un ejercicio dentro de una rutina.
export function updateWorkoutPlanExercise(id: string, payload: UpdateWorkoutPlanExerciseParams) {
   return apiFetch<WorkoutPlanExercise>(`/api/workout-plan-exercises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
   });
}

// Elimina un ejercicio dentro de una rutina.
export function deleteWorkoutPlanExercise(id: string) {
   return apiFetch<WorkoutPlanExercise>(`/api/workout-plan-exercises/${id}`, {
      method: 'DELETE',
   });
}