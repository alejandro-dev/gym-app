import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
   createWorkoutPlan,
   type CreateWorkoutPlanParams,
} from '@/services/api/workoutPlansService';
import { createWorkoutPlanExercise } from '@/services/api/workoutPlanExercisesService';

import type { RoutineExerciseDraft } from '../../types';
import { workoutPlanQueryKeys } from '../../queries/workout-plan/workout-plan-query-keys';

type CreateRoutinePayload = {
   plan: CreateWorkoutPlanParams;
   exercises: RoutineExerciseDraft[];
};

// Hook para crear una nueva rutina.
export function useCreateRoutineMutation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({ plan, exercises }: CreateRoutinePayload) => {
         // Creamos la rutina.
         const createdPlan = await createWorkoutPlan(plan);

         // Añadimos los ejercicios a la rutina. Tiramos casi todas las peticiones a la vez.
         await Promise.all(
            exercises.map((exercise) =>
               createWorkoutPlanExercise({
                  workoutPlanId: createdPlan.id,
                  exerciseId: exercise.exerciseId,
                  order: exercise.order,
                  targetSets: exercise.targetSets,
                  targetRepsMin: exercise.targetRepsMin,
                  targetRepsMax: exercise.targetRepsMax,
                  targetWeightKg: exercise.targetWeightKg,
                  restSeconds: exercise.restSeconds,
                  notes: exercise.notes,
               }),
            ),
         );

         // Devolvemos la rutina creada.
         return createdPlan;
      },
      onSuccess: async () => {
         // Invalidamos la lista de rutinas para actualizar los datos.
         await queryClient.invalidateQueries({
            queryKey: workoutPlanQueryKeys.lists(),
         });
      },
   });
}
