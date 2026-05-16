import { useEffect, useMemo } from "react";
import { useNewRoutine } from "../context/new-routine-context";
import { useWorkoutPlanQuery } from "../queries/workout-plan/use-workout-plan-query";
import { useWorkoutPlanExercisesQuery } from "../queries/workout-plan/use-workout-plan-exercises-query";
import { useUpdateRoutineMutation } from '../mutations/routine/use-update-routine-mutation';
import { Alert } from "react-native";
import { router } from "expo-router";
import { ApiError } from "@/services/api/client";
import { normalizeRoutineExerciseDrafts, toRoutineExerciseDraft } from "../utils/routine-form-utils";

export default function useEditRutineView(id: string) {
   // Contexto para la vista de nueva rutina.
   const routine = useNewRoutine();

   // Hydrate el formulario cuando entramos en modo edición.
   const { hydrateRoutineForEdit } = useNewRoutine();

   // Carga solo los datos básicos de la rutina por id.
   const workoutPlanQuery = useWorkoutPlanQuery(id);

   // Carga los ejercicios de la rutina por id.
   const workoutPlanExercisesQuery = useWorkoutPlanExercisesQuery(id);

   // Mutación para actualizar la rutina.
   const updateRoutineMutation = useUpdateRoutineMutation();

   // Desglosamos los datos de la rutina para mostrarlos en la vista.
   const { data } = workoutPlanQuery;

   // Desglosamos los ejercicios de la rutina para mostrarlos en la vista.
   const exercises = useMemo(
      () => workoutPlanExercisesQuery.data ?? [],
      [workoutPlanExercisesQuery.data],
   );

   // Validamos si el usuario puede actualizar la rutina.
   const canUpdateRoutine =
      routine.name.trim().length > 0 &&
      routine.exercises.length > 0 &&
      !updateRoutineMutation.isPending;

   // Evento para actualizar la rutina.
   const handleUpdateRoutine = async () => {
      if (!id || !canUpdateRoutine) return;

      try {
         await updateRoutineMutation.mutateAsync({
            workoutPlanId: id,
            plan: {
               name: routine.name.trim(),
               description: routine.description.trim() || null,
               goal: routine.selectedGoal,
               level: routine.selectedLevel,
               isActive: routine.status === 'active',
            },
            exercises: routine.exercises,
            originalExercises: routine.originalExercises,
         });

         routine.resetRoutine();

         Alert.alert(
            'Rutina actualizada',
            'Tu rutina se ha actualizado correctamente.',
         );

         router.replace('/training-sessions');
      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo actualizar la rutina. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   };


   // Hydrate los datos de la rutina para mostrarlos en la vista.
   useEffect(() => {
      if (!data) return;

      // El backend devuelve enums y datos nullable; el contexto necesita strings
      // seguros para los inputs y defaults para los selectores.
      hydrateRoutineForEdit({
         name: data.name,
         description: data.description ?? "",
         selectedGoal: data.goal ?? "HYPERTROPHY",
         selectedLevel: data.level ?? "INTERMEDIATE",
         status: data.isActive ? "active" : "draft",
         exercises: normalizeRoutineExerciseDrafts(
            exercises.map((exercise) => toRoutineExerciseDraft(exercise)),
         ),
      });
   }, [data, exercises, hydrateRoutineForEdit]);

   return {
      data,
      isLoading: workoutPlanQuery.isLoading || workoutPlanExercisesQuery.isLoading,
      isError: workoutPlanQuery.isError || workoutPlanExercisesQuery.isError,
      canUpdateRoutine,
      isUpdatingRoutine: updateRoutineMutation.isPending,
      handleUpdateRoutine,
   };
}
