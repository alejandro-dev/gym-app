import { useQuery } from '@tanstack/react-query';

import { getWorkoutPlan } from '@/services/api/workoutPlansService';

import { workoutPlanQueryKeys } from './workout-plan-query-keys';

export function useWorkoutPlanQuery(id: string) {
   return useQuery({
      queryKey: workoutPlanQueryKeys.detail(id),
      queryFn: () => getWorkoutPlan(id),
      enabled: id.length > 0,
   });
}
