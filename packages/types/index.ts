export type UserRole = "USER" | "ADMIN" | "COACH";
export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "ARMS"
  | "CORE"
  | "FULL_BODY"
  | "GLUTES"
  | "CALVES"
  | "CARDIO";
export type ExerciseCategory = "STRENGTH" | "BODYWEIGHT" | "CARDIO";
export type WorkoutPlanGoal =
  | "STRENGTH"
  | "HYPERTROPHY"
  | "FAT_LOSS"
  | "ENDURANCE"
  | "GENERAL_FITNESS"
  | "REHAB";
export type WorkoutPlanLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// Valores canónicos que entiende la API. La UI debe guardar estos enums,
// y usar los mapas de labels solo para mostrar texto al usuario.
export const WORKOUT_PLAN_GOAL_VALUES = [
  "STRENGTH",
  "HYPERTROPHY",
  "FAT_LOSS",
  "ENDURANCE",
  "GENERAL_FITNESS",
  "REHAB",
] as const satisfies readonly WorkoutPlanGoal[];

export const WORKOUT_PLAN_LEVEL_VALUES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const satisfies readonly WorkoutPlanLevel[];

// Labels compartidos para que web y mobile enseñen los mismos textos.
export const WORKOUT_PLAN_GOAL_LABELS_ES: Record<WorkoutPlanGoal, string> = {
  STRENGTH: "Fuerza",
  HYPERTROPHY: "Hipertrofia",
  FAT_LOSS: "Pérdida de grasa",
  ENDURANCE: "Resistencia",
  GENERAL_FITNESS: "Fitness general",
  REHAB: "Readaptación",
};

export const WORKOUT_PLAN_LEVEL_LABELS_ES: Record<WorkoutPlanLevel, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

// Helpers pequeños para evitar que cada app indexe los mapas a mano.
export function getWorkoutPlanGoalLabelEs(goal: WorkoutPlanGoal) {
  return WORKOUT_PLAN_GOAL_LABELS_ES[goal];
}

export function getWorkoutPlanLevelLabelEs(level: WorkoutPlanLevel) {
  return WORKOUT_PLAN_LEVEL_LABELS_ES[level];
}

export type WorkoutPlanType = "new" | "copy";

export const ROLE_GROUP_VALUES = [
  "USER",
  "ADMIN",
  "COACH",
] as const satisfies readonly UserRole[];

export const MUSCLE_GROUP_VALUES = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "FULL_BODY",
  "GLUTES",
  "CALVES",
  "CARDIO",
] as const satisfies readonly MuscleGroup[];

export const EXERCISE_CATEGORY_VALUES = [
  "STRENGTH",
  "BODYWEIGHT",
  "CARDIO",
] as const satisfies readonly ExerciseCategory[];

export const MUSCLE_GROUP_LABELS_ES: Record<MuscleGroup, string> = {
  CHEST: "Pecho",
  BACK: "Espalda",
  LEGS: "Piernas",
  SHOULDERS: "Hombros",
  ARMS: "Brazos",
  CORE: "Core",
  FULL_BODY: "Cuerpo completo",
  GLUTES: "Glúteos",
  CALVES: "Gemelos",
  CARDIO: "Cardio",
};

export const EXERCISE_CATEGORY_LABELS_ES: Record<ExerciseCategory, string> = {
  STRENGTH: "Fuerza",
  BODYWEIGHT: "Peso corporal",
  CARDIO: "Cardio",
};

export function getMuscleGroupLabelEs(muscleGroup: MuscleGroup) {
  return MUSCLE_GROUP_LABELS_ES[muscleGroup];
}

export function getExerciseCategoryLabelEs(category: ExerciseCategory) {
  return EXERCISE_CATEGORY_LABELS_ES[category];
}

// Representa el usuario publico que devuelve la API.
// Las fechas llegan serializadas como string ISO en las respuestas JSON.
export interface User {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  coachId: string | null;
  weightKg: number | null;
  heightCm: number | null;
  birthDate: string | null;
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Representa el listado de usuarios públicos que devuelve la API.
export interface UsersListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  muscleGroup: MuscleGroup;
  equipment: string | null;
  isCompound: boolean;
  category: ExerciseCategory;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesListResponse {
  items: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string | null;
  user: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  name: string;
  description: string | null;
  goal: WorkoutPlanGoal | null;
  level: WorkoutPlanLevel | null;
  durationWeeks: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  exercises?: WorkoutPlanExercise[];
}

// export interface WorkoutPlanDetails extends WorkoutPlan {
//    exercises: Exercise[];
// }

export interface WorkoutPlansListResponse {
  items: WorkoutPlan[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkoutPlanExercise {
  id: string;
  workoutPlanId: string;
  exerciseId: string;
  day: number | null;
  order: number;
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    slug?: string;
    muscleGroup: MuscleGroup;
    category: ExerciseCategory;
    equipment: string | null;
    isCompound?: boolean;
  };
}
