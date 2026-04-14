import { backendFetch } from "@/services/backend";
import { WorkoutPlansListResponse } from "@gym-app/types";

type SearchWorkoutPlansParams = {
   page?: number;
   limit?: number;
   search?: string;
};

// Función que realiza la llamada paginada a la API de planes de entrenamiento.
export async function searchWorkoutPlans({
   page = 0,
   limit = 10,
   search = "",
}: SearchWorkoutPlansParams = {}): Promise<WorkoutPlansListResponse> {
   const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search ?? "",
   });

   return backendFetch(`/api/workout-plans?${searchParams.toString()}`);
}
