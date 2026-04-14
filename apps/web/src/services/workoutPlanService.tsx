import type {
   WorkoutPlan,
   WorkoutPlanGoal,
   WorkoutPlanLevel,
   WorkoutPlansListResponse,
} from "@gym-app/types";

import { fetchJson } from "./httpClient";

export interface SearchWorkoutPlansParams {
   page: number;
   limit: number;
   search?: string;
}

export interface CreateWorkoutPlanPayload {
   userId: string | null;
   name: string;
   description: string | null;
   isActive: boolean;
   goal: WorkoutPlanGoal | null;
   level: WorkoutPlanLevel | null;
   durationWeeks: number | null;
}

export type UpdateWorkoutPlanPayload = Omit<CreateWorkoutPlanPayload, "userId">;

// Construye la URL para listar/buscar planes con paginación.
export function buildWorkoutPlansSearchPath(
   params: SearchWorkoutPlansParams = {
      page: 0,
      limit: 0,
      search: "",
   },
): string {
   const { page = 0, limit = 10, search = "" } = params;
   const queryParams = new URLSearchParams();

   if (search) queryParams.append("search", search);

   queryParams.append("page", page.toString());
   queryParams.append("limit", limit.toString());

   const queryString = queryParams.toString();
   return `/api/workout-plans${queryString ? `?${queryString}` : ""}`;
}

// Función que realiza la búsqueda paginada de planes.
export async function searchWorkoutPlans(
   params: SearchWorkoutPlansParams,
): Promise<WorkoutPlansListResponse> {
   return fetchJson<WorkoutPlansListResponse>(buildWorkoutPlansSearchPath(params), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
   });
}

// Función que crea un plan de entrenamiento.
export async function createWorkoutPlan(
   payload: CreateWorkoutPlanPayload,
): Promise<WorkoutPlan> {
   return fetchJson<WorkoutPlan>("/api/workout-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}

// Función que actualiza un plan de entrenamiento existente.
export async function updateWorkoutPlan(
   id: string,
   payload: UpdateWorkoutPlanPayload,
): Promise<WorkoutPlan> {
   return fetchJson<WorkoutPlan>(`/api/workout-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}
