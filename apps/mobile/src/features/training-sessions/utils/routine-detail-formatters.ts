import { getWorkoutPlanGoalLabelEs, getWorkoutPlanLevelLabelEs, WorkoutPlan, WorkoutPlanExercise } from "@gym-app/types";

// Función que convierte el input de semanas en number | null para la API.
function formatGoal(workoutPlan: WorkoutPlan) {
   return workoutPlan.goal ? getWorkoutPlanGoalLabelEs(workoutPlan.goal) : 'Objetivo';
}

// Función que convierte el input de nivel en string para la API.
function formatLevel(workoutPlan: WorkoutPlan) {
   return workoutPlan.level ? getWorkoutPlanLevelLabelEs(workoutPlan.level) : 'Nivel';
}

// Función que convierte el input de kg en string para la API.
function formatMetric(value: number | null) {
   return value ? String(value) : '-';
}

// Función que convierte el input de reps en string para la API.
function formatWeight(value: number | null) {
   return value ? String(value) : '-';
}

// Función que convierte el input de reps en string para la API.
function formatReps(exercise: WorkoutPlanExercise) {
   if (exercise.targetRepsMin && exercise.targetRepsMax) {
      return `${exercise.targetRepsMin}-${exercise.targetRepsMax}`;
   }

   return exercise.targetRepsMin || exercise.targetRepsMax
      ? String(exercise.targetRepsMin ?? exercise.targetRepsMax)
      : '-';
}

export {
   formatGoal,
   formatLevel,
   formatMetric,
   formatWeight,
   formatReps,
};