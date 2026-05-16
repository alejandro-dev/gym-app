import { useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { ApiError } from '@/services/api/client';
import { useProfileQuery } from '@/features/profile/queries/use-profile-query';

import { useNewRoutine } from '../context/new-routine-context';
import { useCreateRoutineMutation } from '../mutations/routine/use-create-routine-mutation';
import { useWorkoutPlanQuery } from '../queries/workout-plan/use-workout-plan-query';
import { useWorkoutPlanExercisesQuery } from '../queries/workout-plan/use-workout-plan-exercises-query';
import {
   normalizeRoutineExerciseDrafts,
   toRoutineExerciseDraft,
} from '../utils/routine-form-utils';

export default function useDuplicateRoutineView(id: string) {
   const routine = useNewRoutine();
   const { hydrateRoutineForEdit } = useNewRoutine();

   const profileQuery = useProfileQuery();
   const workoutPlanQuery = useWorkoutPlanQuery(id);
   const workoutPlanExercisesQuery = useWorkoutPlanExercisesQuery(id);
   const createRoutineMutation = useCreateRoutineMutation();

   const { data } = workoutPlanQuery;

   const exercises = useMemo(
      () => workoutPlanExercisesQuery.data ?? [],
      [workoutPlanExercisesQuery.data],
   );

   const canDuplicateRoutine =
      routine.name.trim().length > 0 &&
      routine.exercises.length > 0 &&
      Boolean(profileQuery.data?.id) &&
      !createRoutineMutation.isPending;

   const handleCreateDuplicateRoutine = async () => {
      const profile = profileQuery.data;

      if (!profile || !canDuplicateRoutine) return;

      try {
         await createRoutineMutation.mutateAsync({
            plan: {
               userId: profile.id,
               name: routine.name.trim(),
               description: routine.description.trim() || null,
               goal: routine.selectedGoal,
               level: routine.selectedLevel,
               isActive: routine.status === 'active',
            },
            exercises: routine.exercises,
         });

         routine.resetRoutine();

         Alert.alert(
            'Rutina duplicada',
            'La copia de la rutina se ha creado correctamente.',
         );

         router.replace('/training-sessions');
      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo duplicar la rutina. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   };

   useEffect(() => {
      if (!data) return;

      hydrateRoutineForEdit({
         name: `${data.name} (copia)`,
         description: data.description ?? '',
         selectedGoal: data.goal ?? 'HYPERTROPHY',
         selectedLevel: data.level ?? 'INTERMEDIATE',
         status: data.isActive ? 'active' : 'draft',
         exercises: normalizeRoutineExerciseDrafts(
            exercises.map((exercise) =>
               toRoutineExerciseDraft(exercise, 'duplicate'),
            ),
         ),
         originalExercises: [],
      });
   }, [data, exercises, hydrateRoutineForEdit]);

   return {
      data,
      isLoading:
         workoutPlanQuery.isLoading ||
         workoutPlanExercisesQuery.isLoading ||
         profileQuery.isLoading,
      isError:
         workoutPlanQuery.isError ||
         workoutPlanExercisesQuery.isError ||
         profileQuery.isError,
      canDuplicateRoutine,
      isDuplicatingRoutine: createRoutineMutation.isPending,
      handleCreateDuplicateRoutine,
   };
}
