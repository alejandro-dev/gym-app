import {
  Exercise,
  ExerciseCategory,
  ExercisesListResponse,
  MuscleGroup,
} from "@gym-app/types";
import { fetchJson } from "./httpClient";

export interface SearchExercisesParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CreateExercisePayload {
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  equipment: string | null;
  isCompound: boolean;
}

export interface UpdateExercisePayload {
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  equipment: string | null;
  isCompound: boolean;
}

// Construye la URL para listar/buscar ejercicios con paginación.
export function buildExercisesSearchPath(
  params: SearchExercisesParams = {
    page: 0,
    limit: 10,
    search: "",
  },
): string {
  const { page = 0, limit = 10, search = "" } = params;
  const queryParams = new URLSearchParams();

  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  const queryString = queryParams.toString();
  return `/api/exercises${queryString ? `?${queryString}` : ""}`;
}

// Función que realiza la búsqueda paginada de ejercicios.
export async function searchExercises(
  params: SearchExercisesParams,
): Promise<ExercisesListResponse> {
  return fetchJson<ExercisesListResponse>(buildExercisesSearchPath(params), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

// Función que crea un ejercicio.
export async function createExercise(
  payload: CreateExercisePayload,
): Promise<Exercise> {
  return fetchJson<Exercise>("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Función que actualiza un ejercicio existente.
export async function updateExercise(
  id: string,
  payload: UpdateExercisePayload,
): Promise<Exercise> {
  return fetchJson<Exercise>(`/api/exercises/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Función que elimina un ejercicio existente.
export async function deleteExercise(id: string): Promise<Exercise> {
  return fetchJson<Exercise>(`/api/exercises/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}
