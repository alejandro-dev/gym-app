import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
   updateWorkoutPlan,
   type UpdateWorkoutPlanParams,
} from '@/services/api/workoutPlansService';
import {
   createWorkoutPlanExercise,
   deleteWorkoutPlanExercise,
   updateWorkoutPlanExercise,
} from '@/services/api/workoutPlanExercisesService';

import type { RoutineExerciseDraft } from '../../types';
import { workoutPlanQueryKeys } from '../../queries/workout-plan/workout-plan-query-keys';
import { buildRoutineExerciseChangeSet } from '../../utils/routine-exercise-changes';

type UpdateRoutinePayload = {
   workoutPlanId: string;
   plan: UpdateWorkoutPlanParams;
   exercises: RoutineExerciseDraft[];
   originalExercises: RoutineExerciseDraft[];
};

export function useUpdateRoutineMutation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         workoutPlanId,
         plan,
         exercises,
         originalExercises,
      }: UpdateRoutinePayload) => {
         // Actualizamos la rutina
         const updatedPlan = await updateWorkoutPlan(workoutPlanId, plan);

         const {
            removedExercises,
            exercisesToCreate,
            exercisesToUpdate,
         } = buildRoutineExerciseChangeSet(exercises, originalExercises);

         // Actualizamos los ejercicios a la rutina.
         await Promise.all([
            ...removedExercises.map((exercise) =>
               deleteWorkoutPlanExercise(exercise.id),
            ),
            ...exercisesToCreate.map((payload) =>
               createWorkoutPlanExercise({
                  workoutPlanId,
                  ...payload,
               }),
            ),
            ...exercisesToUpdate.map(({ id, payload }) =>
               updateWorkoutPlanExercise(id, payload),
            ),
         ]);

         return updatedPlan;
      },
      onSuccess: async (_updatedPlan, { workoutPlanId }) => {
         await Promise.all([
            queryClient.invalidateQueries({
               queryKey: workoutPlanQueryKeys.lists(),
            }),
            queryClient.invalidateQueries({
               queryKey: workoutPlanQueryKeys.detail(workoutPlanId),
            }),
         ]);
      },
   });
}
