import { useQuery } from '@tanstack/react-query';

import {
  getCompletedWorkoutSessions,
  type SearchWorkoutSessionsParams,
} from '@/services/api/workoutSessionService';

import { workoutSessionQueryKeys } from '../../training-sessions/queries/workout-sessions/workout-session-query-keys';

export function useCompletedWorkoutSessionsQuery(params: SearchWorkoutSessionsParams = {}) {
   return useQuery({
      queryKey: workoutSessionQueryKeys.completed(params),
      queryFn: () => getCompletedWorkoutSessions(params),
   });
}
