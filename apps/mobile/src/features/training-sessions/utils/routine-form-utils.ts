import { WorkoutPlanExercise } from "@gym-app/types";
import { RoutineExerciseDraft } from "../types";

// Función que convierte el input de semanas en number | null para la API.
export function toOptionalNumber(value: string) {
   const normalizedValue = value.trim().replace(',', '.');

   if (!normalizedValue) {
      return null;
   }

   const parsedValue = Number(normalizedValue);

   return Number.isFinite(parsedValue) ? parsedValue : null;
}
 
// Función que convierte un ejercicio recibido de la API en un ejercicio editable del formulario.
export function toRoutineExerciseDraft(item: WorkoutPlanExercise, idPrefix?: string): RoutineExerciseDraft {
   return {
      id: idPrefix ? `${idPrefix}-${item.id}` : item.id,
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

export function normalizeRoutineExerciseDrafts(
   exercises: RoutineExerciseDraft[],
): RoutineExerciseDraft[] {
   return exercises.map((exercise, index) => ({
      ...exercise,
      day: null,
      order: index + 1,
   }));
}
