"use client";

import type {
   ExerciseCategory,
   MuscleGroup,
   WorkoutPlan,
} from "@gym-app/types";

export type WorkoutPlanGoal =
   | "STRENGTH"
   | "HYPERTROPHY"
   | "FAT_LOSS"
   | "ENDURANCE"
   | "GENERAL_FITNESS"
   | "REHAB";

export type WorkoutPlanLevel =
   | "BEGINNER"
   | "INTERMEDIATE"
   | "ADVANCED";

// Versión editable del item WorkoutPlanExercise para la UI.
// Permite exerciseId null porque una fila nueva puede existir antes de elegir Exercise.
export type WorkoutPlanExerciseDraft = {
   id: string;
   workoutPlanId: string;
   isDraft?: boolean;
   day: number | null;
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

export const WORKOUT_PLAN_GOAL_LABELS: Record<WorkoutPlanGoal, string> = {
   STRENGTH: "Fuerza",
   HYPERTROPHY: "Hipertrofia",
   FAT_LOSS: "Pérdida de grasa",
   ENDURANCE: "Resistencia",
   GENERAL_FITNESS: "Fitness general",
   REHAB: "Readaptación",
};

export const WORKOUT_PLAN_LEVEL_LABELS: Record<WorkoutPlanLevel, string> = {
   BEGINNER: "Principiante",
   INTERMEDIATE: "Intermedio",
   ADVANCED: "Avanzado",
};

export const WORKOUT_PLAN_GOALS = Object.keys(
   WORKOUT_PLAN_GOAL_LABELS,
) as WorkoutPlanGoal[];

export const WORKOUT_PLAN_LEVELS = Object.keys(
   WORKOUT_PLAN_LEVEL_LABELS,
) as WorkoutPlanLevel[];

export function getWorkoutPlanGoalLabel(goal?: WorkoutPlanGoal | null) {
   return goal ? WORKOUT_PLAN_GOAL_LABELS[goal] : "Sin objetivo";
}

export function getWorkoutPlanLevelLabel(level?: WorkoutPlanLevel | null) {
   return level ? WORKOUT_PLAN_LEVEL_LABELS[level] : "Sin nivel";
}
