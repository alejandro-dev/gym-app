import { SearchWorkoutSessionsParams } from "@/services/api/workoutSessionService";

export const workoutSessionQueryKeys = {
   // Clave base
   all: ['workout-sessions'] as const,

   // Claves de lista
   lists: () => [...workoutSessionQueryKeys.all, 'list'] as const,

   // Claves de consulta
   // Detalle de sesion de entrenamiento
   detail: (id: string) => [...workoutSessionQueryKeys.all, id] as const,
   
   // Listado de sesiones de entrenamiento
   completed: (params: SearchWorkoutSessionsParams = {}) =>
      [...workoutSessionQueryKeys.lists(), 'completed', params] as const,

   // Detalle de sesion de entrenamiento
   completedDetail: (id: string) =>
      [...workoutSessionQueryKeys.lists(), 'completed', id] as const,
};
