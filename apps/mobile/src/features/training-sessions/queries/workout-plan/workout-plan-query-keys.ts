import type { SearchWorkoutPlansParams } from '@/services/api/workoutPlansService';


// Claves de consulta para las sesiones de entrenamiento
export const workoutPlanQueryKeys = {
   // Clave base
   all: ['workout-plans'] as const,

   // Clave para agrupar todos los listados de rutinas
   lists: () => [...workoutPlanQueryKeys.all, 'list'] as const,

   // Clave concreta para un listado con parámetros específicos.
   list: (params: SearchWorkoutPlansParams) =>
      [...workoutPlanQueryKeys.lists(), params] as const,

   // Clave para obtener detalles de una rutina
   detail: (id: string) => [...workoutPlanQueryKeys.all, 'detail', id] as const,

};