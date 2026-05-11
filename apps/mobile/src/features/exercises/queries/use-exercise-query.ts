import { useQuery } from '@tanstack/react-query';

import { getExercise } from '@/services/api/exercisesService';

import { exerciseQueryKeys } from './exercise-query-keys';

// Consulta el detalle completo de un ejercicio.
export function useExerciseQuery(exerciseId: string) {
   return useQuery({
      queryKey: exerciseQueryKeys.detail(exerciseId),
      queryFn: () => getExercise(exerciseId),
      enabled: Boolean(exerciseId),
   });
}
