import type { SearchExercisesParams } from '@/services/api/exercisesService';

export const exerciseQueryKeys = {
   // Clave base
   all: ['exercises'] as const,

   // Clave para agrupar todos los listados de ejercicios
   lists: () => [...exerciseQueryKeys.all, 'list'] as const,

   // Clave concreta para un listado con parámetros específicos.
   list: (params: SearchExercisesParams) =>
      [...exerciseQueryKeys.lists(), params] as const,

   // Clave para agrupar todos los detalles de ejercicios.
   details: () => [...exerciseQueryKeys.all, 'detail'] as const,

   // Clave concreta para el detalle de un ejercicio.
   detail: (exerciseId: string) =>
      [...exerciseQueryKeys.details(), exerciseId] as const,
};
