import { SearchWorkoutSessionsParams } from "@/services/api/workoutSessionService";

export const workoutSessionQueryKeys = {
   // Clave base
   all: ['workout-sessions'] as const,
   lists: () => [...workoutSessionQueryKeys.all, 'list'] as const,
   completed: (params: SearchWorkoutSessionsParams = {}) =>
      [...workoutSessionQueryKeys.lists(), 'completed', params] as const,
};