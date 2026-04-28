import { useQuery } from '@tanstack/react-query';

import {
   getWorkoutPlans,
   type SearchWorkoutPlansParams,
} from '@/services/api/workoutPlanService';

import { workoutPlanQueryKeys } from './workout-plan-query-keys';

export function useWorkoutPlansQuery(params: SearchWorkoutPlansParams = {}) {
   return useQuery({
      queryKey: workoutPlanQueryKeys.list(params),
      queryFn: () => getWorkoutPlans(params),
   });
}
