import { useQuery } from '@tanstack/react-query';

import {
  getCompletedWorkoutSession,
  getCompletedWorkoutSessions,
  getWorkoutSession,
  type SearchWorkoutSessionsParams,
} from '@/services/api/workoutSessionService';

import { workoutSessionQueryKeys } from '../../training-sessions/queries/workout-sessions/workout-session-query-keys';

// Query para obtener una sesion de entrenamiento.
export function useWorkoutSessionQuery(id: string) {
   return useQuery({
      queryKey: workoutSessionQueryKeys.detail(id),
      queryFn: () => getWorkoutSession(id),
      enabled: Boolean(id),
   });
}

// Query para obtener las sesiones de entrenamiento completadas.
export function useCompletedWorkoutSessionsQuery(params: SearchWorkoutSessionsParams = {}) {
   return useQuery({
      queryKey: workoutSessionQueryKeys.completed(params),
      queryFn: () => getCompletedWorkoutSessions(params),
   });
}

// Query para obtener una sesion de entrenamiento completada.
export function useCompletedWorkoutSessionQuery(id: string) {
   return useQuery({
      queryKey: workoutSessionQueryKeys.completedDetail(id),
      queryFn: () => getCompletedWorkoutSession(id),
      enabled: Boolean(id),
   });
}
