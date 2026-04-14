import type { WorkoutPlanExercise } from "@gym-app/types";

import { fetchJson } from "./httpClient";

export type WorkoutPlanExercisePayload = {
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

export type UpdateWorkoutPlanExercisePayload = Omit<
   WorkoutPlanExercisePayload,
   "workoutPlanId"
>;

// Lista los ejercicios asignados a un plan concreto.
export async function searchWorkoutPlanExercises(
   workoutPlanId: string,
): Promise<WorkoutPlanExercise[]> {
   const searchParams = new URLSearchParams({ workoutPlanId });

   return fetchJson<WorkoutPlanExercise[]>(
      `/api/workout-plan-exercises?${searchParams.toString()}`,
   );
}

// Crea una nueva relación WorkoutPlanExercise usando un Exercise existente.
export async function createWorkoutPlanExercise(
   payload: WorkoutPlanExercisePayload,
): Promise<WorkoutPlanExercise> {
   return fetchJson<WorkoutPlanExercise>("/api/workout-plan-exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}

// Actualiza la prescripción y el Exercise asociado a un item del plan.
export async function updateWorkoutPlanExercise(
   id: string,
   payload: UpdateWorkoutPlanExercisePayload,
): Promise<WorkoutPlanExercise> {
   return fetchJson<WorkoutPlanExercise>(`/api/workout-plan-exercises/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}

// Elimina un ejercicio asignado al plan.
export async function deleteWorkoutPlanExercise(
   id: string,
): Promise<WorkoutPlanExercise> {
   return fetchJson<WorkoutPlanExercise>(`/api/workout-plan-exercises/${id}`, {
      method: "DELETE",
   });
}
