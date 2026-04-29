import { useEffect, useMemo } from "react";
import { useNewRoutine } from "../context/new-routine-context";
import { useWorkoutPlanQuery } from "../queries/use-workout-plan-query";
import { useWorkoutPlanExercisesQuery } from "../queries/use-workout-plan-exercises-query";
import { WorkoutPlanExercise } from "@gym-app/types";
import { RoutineExerciseDraft } from "../types";

export default function useEditRutineView(id: string) {
   // Hydrate el formulario cuando entramos en modo edición.
   const { hydrateRoutineForEdit } = useNewRoutine();

   // Carga solo los datos básicos de la rutina por id.
   const workoutPlanQuery = useWorkoutPlanQuery(id);

   // Carga los ejercicios de la rutina por id.
   const workoutPlanExercisesQuery = useWorkoutPlanExercisesQuery(id);


   // Desglosamos los datos de la rutina para mostrarlos en la vista.
   const { data } = workoutPlanQuery;

   // Desglosamos los ejercicios de la rutina para mostrarlos en la vista.
   const exercises = useMemo(
      () => workoutPlanExercisesQuery.data ?? [],
      [workoutPlanExercisesQuery.data],
   );

   // Hydrate los datos de la rutina para mostrarlos en la vista.
   useEffect(() => {
      if (!data) return;

      // El backend devuelve enums y datos nullable; el contexto necesita strings
      // seguros para los inputs y defaults para los selectores.
      hydrateRoutineForEdit({
         name: data.name,
         description: data.description ?? "",
         durationWeeks: data.durationWeeks ? String(data.durationWeeks) : "",
         selectedGoal: data.goal ?? "HYPERTROPHY",
         selectedLevel: data.level ?? "INTERMEDIATE",
         status: data.isActive ? "active" : "draft",
         exercises: exercises.map(toRoutineExerciseDraft),
      });
   }, [data, exercises, hydrateRoutineForEdit]);

   return {
      data,
      isLoading: workoutPlanQuery.isLoading || workoutPlanExercisesQuery.isLoading,
      isError: workoutPlanQuery.isError || workoutPlanExercisesQuery.isError,
   };
}

// Función para convertir un ejercicio de la API a un borrador local.
function toRoutineExerciseDraft(item: WorkoutPlanExercise): RoutineExerciseDraft {
   return {
      id: item.id,
      exerciseId: item.exerciseId,
      exerciseName: item.exercise.name,
      muscleGroup: item.exercise.muscleGroup,
      category: item.exercise.category,
      equipment: item.exercise.equipment,
      isCompound: item.exercise.isCompound ?? false,
      day: item.day,
      order: item.order,
      targetSets: item.targetSets,
      targetRepsMin: item.targetRepsMin,
      targetRepsMax: item.targetRepsMax,
      targetWeightKg: item.targetWeightKg,
      restSeconds: item.restSeconds,
      notes: item.notes,
   };
}
