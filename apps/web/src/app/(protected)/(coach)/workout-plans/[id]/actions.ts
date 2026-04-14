import { backendFetch } from "@/services/backend";
import {
   Exercise,
   ExercisesListResponse,
   WorkoutPlan,
   WorkoutPlanExercise,
} from "@gym-app/types";

// Obtiene el plan concreto que alimenta la pantalla completa de edición.
export async function getWorkoutPlan(id: string): Promise<WorkoutPlan> {
   return backendFetch(`/api/workout-plans/${id}`);
}

// Obtiene los ejercicios asignados a este plan desde su recurso específico.
export async function getWorkoutPlanExercises(
   workoutPlanId: string,
): Promise<WorkoutPlanExercise[]> {
   const searchParams = new URLSearchParams({
      workoutPlanId,
   });

   return backendFetch(`/api/workout-plan-exercises?${searchParams.toString()}`);
}

// Obtiene el catálogo de ejercicios para seleccionar ejercicios existentes en un plan.
export async function getExerciseCatalog(): Promise<Exercise[]> {
   // La vista solo necesita opciones para seleccionar, así que pedimos una página amplia.
   // Si el catálogo crece mucho, aquí conviene cambiar a búsqueda remota paginada.
   const response = await backendFetch<ExercisesListResponse>(
      "/api/exercises?page=0&limit=100&search=&muscleGroup=&category=",
   );

   return response.items;
}
