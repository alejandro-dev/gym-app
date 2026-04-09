"use server";

import { backendFetch } from "@/services/backend";
import { ExercisesListResponse } from "@gym-app/types";

type SearchExercisesParams = {
	page?: number;
	limit?: number;
	search?: string;
	muscleGroup?: string;
	category?: string;
};


// Función que realiza la llamada paginada a la API de ejercicios.
export async function searchExercises({
   page = 0,
	limit = 10,
	search = "",
	muscleGroup = "",
	category = "",
}: SearchExercisesParams = {}): Promise<ExercisesListResponse> {
   const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		search: search ?? "",
		muscleGroup: muscleGroup ?? "",
		category: category ?? "",
	});
   
   return backendFetch(`/api/exercises?${searchParams.toString()}`);
}