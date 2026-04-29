import { useQuery } from '@tanstack/react-query';

import { getWorkoutPlanExercises } from '@/services/api/workoutPlanExercisesService';

import { workoutPlanQueryKeys } from './workout-plan-query-keys';

export function useWorkoutPlanExercisesQuery(workoutPlanId: string) {
   return useQuery({
      queryKey: [...workoutPlanQueryKeys.detail(workoutPlanId), 'exercises'],
      queryFn: () => getWorkoutPlanExercises(workoutPlanId),
      enabled: workoutPlanId.length > 0,
   });
}
