import type {
   ExerciseCategory,
   ExercisesListResponse,
   MuscleGroup,
} from '@gym-app/types';

import { apiFetch } from '@/services/api/client';

export type SearchExercisesParams = {
   page?: number;
   limit?: number;
   search?: string;
   muscleGroup?: MuscleGroup;
   category?: ExerciseCategory;
};

// Ruta de búsqueda de ejercicios.
export function buildExercisesPath({
   page = 0,
   limit = 100,
   search = '',
   muscleGroup,
   category,
}: SearchExercisesParams = {}) {
   const params = new URLSearchParams();

   params.set('page', String(page));
   params.set('limit', String(limit));

   if (search.trim()) params.set('search', search.trim());
   if (muscleGroup) params.set('muscleGroup', muscleGroup);
   if (category) params.set('category', category);

   return `/api/exercises?${params.toString()}`;
}

// Consulta de ejercicios.
export function getExercises(params?: SearchExercisesParams) {
   return apiFetch<ExercisesListResponse>(buildExercisesPath(params));
}
