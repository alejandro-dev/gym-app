"use client";

import type {
   ExerciseCategory,
   MuscleGroup,
   WorkoutPlan,
   WorkoutPlanGoal,
   WorkoutPlanLevel,
} from "@gym-app/types";
import {
   WORKOUT_PLAN_GOAL_LABELS_ES,
   WORKOUT_PLAN_GOAL_VALUES,
   WORKOUT_PLAN_LEVEL_LABELS_ES,
   WORKOUT_PLAN_LEVEL_VALUES,
} from "@gym-app/types";

export type { WorkoutPlanGoal, WorkoutPlanLevel };

// Versión editable del item WorkoutPlanExercise para la UI.
// Permite exerciseId null porque una fila nueva puede existir antes de elegir Exercise.
export type WorkoutPlanExerciseDraft = {
   id: string;
   workoutPlanId: string;
   isDraft?: boolean;
   order: number;
   exerciseId: string | null;
   exercise?: {
      id: string;
      name: string;
      slug?: string;
      muscleGroup: MuscleGroup;
      category: ExerciseCategory;
      equipment: string | null;
      isCompound?: boolean;
   } | null;
   targetSets: number | null;
   targetRepsMin: number | null;
   targetRepsMax: number | null;
   targetWeightKg: number | null;
   restSeconds: number | null;
   notes: string | null;
};

// El modelo compartido WorkoutPlan trae exercises como datos persistidos.
// En la vista necesitamos una variante editable con drafts y metadatos locales.
export type WorkoutPlanViewModel = Omit<WorkoutPlan, "exercises"> & {
   exercisesCount?: number | null;
   sourcePlanId?: string | null;
   exercises?: WorkoutPlanExerciseDraft[];
};

// Mantiene la API local que ya usa web, pero los datos salen del paquete común.
export const WORKOUT_PLAN_GOAL_LABELS = WORKOUT_PLAN_GOAL_LABELS_ES;
export const WORKOUT_PLAN_LEVEL_LABELS = WORKOUT_PLAN_LEVEL_LABELS_ES;

export const WORKOUT_PLAN_GOALS = [...WORKOUT_PLAN_GOAL_VALUES];
export const WORKOUT_PLAN_LEVELS = [...WORKOUT_PLAN_LEVEL_VALUES];

export function getWorkoutPlanGoalLabel(goal?: WorkoutPlanGoal | null) {
   return goal ? WORKOUT_PLAN_GOAL_LABELS[goal] : "Sin objetivo";
}

export function getWorkoutPlanLevelLabel(level?: WorkoutPlanLevel | null) {
   return level ? WORKOUT_PLAN_LEVEL_LABELS[level] : "Sin nivel";
}
