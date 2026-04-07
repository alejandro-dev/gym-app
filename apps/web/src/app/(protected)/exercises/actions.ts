"use server";

import { backendFetch } from "@/services/backend";
import { ExercisesListResponse } from "@gym-app/types";

type SearchExercisesParams = {
	page?: number;
	limit?: number;
	search?: string;
};


// Función que realiza la llamada paginada a la API de ejercicios.
export async function searchExercises({
   page = 0,
	limit = 10,
	search = "",
}: SearchExercisesParams = {}): Promise<ExercisesListResponse> {
   const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		search: search ?? "",
	});
   
   return backendFetch(`/api/exercises?${searchParams.toString()}`);
}