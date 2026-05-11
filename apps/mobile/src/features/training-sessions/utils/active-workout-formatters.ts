import { WorkoutPlanExercise } from "@gym-app/types";

// Obtenemos el texto de descanso.
export function getRestLabel(exercise: WorkoutPlanExercise) {
   return exercise.restSeconds
      ? `${Math.round(exercise.restSeconds / 60)}:${String(exercise.restSeconds % 60).padStart(2, '0')}`
      : 'APAGADO';
}

// Obtenemos el total de series de las rutinas.
export function getTotalSets(exercises: WorkoutPlanExercise[]) {
   return exercises.reduce(
      (sum, item) => sum + Math.max(item.targetSets ?? 1, 1),
      0,
   );
}
   
// Obtenemos el total de volumen de las rutinas.
export function getTotalVolume(exercises: WorkoutPlanExercise[]) {
   return exercises.reduce((sum, item) => {
      const sets = Math.max(item.targetSets ?? 1, 1);
      const reps = item.targetRepsMax ?? item.targetRepsMin ?? 0;
      const weight = item.targetWeightKg ?? 0;

      return sum + sets * reps * weight;
   }, 0);
}