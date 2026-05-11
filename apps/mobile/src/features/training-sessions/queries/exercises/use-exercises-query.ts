import { useQuery } from '@tanstack/react-query';

import {
   getExercises,
   type SearchExercisesParams,
} from '@/services/api/exercisesService';

import { exerciseQueryKeys } from '../../../exercises/queries/exercise-query-keys';

// Consulta de ejercicios.
export function useExercisesQuery(params: SearchExercisesParams = {}) {
   return useQuery({
      queryKey: exerciseQueryKeys.list(params),
      queryFn: () => getExercises(params),
   });
}
