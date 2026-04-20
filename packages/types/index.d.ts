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

export type WorkoutPlanType = "new" | "copy";

export declare const ROLE_GROUP_VALUES: readonly UserRole[];
export declare const MUSCLE_GROUP_VALUES: readonly MuscleGroup[];
export declare const EXERCISE_CATEGORY_VALUES: readonly ExerciseCategory[];

export declare const MUSCLE_GROUP_LABELS_ES: Record<MuscleGroup, string>;
export declare const EXERCISE_CATEGORY_LABELS_ES: Record<
  ExerciseCategory,
  string
>;

export declare function getMuscleGroupLabelEs(muscleGroup: MuscleGroup): string;

export declare function getExerciseCategoryLabelEs(
  category: ExerciseCategory,
): string;

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
  createdById: string;
  name: string;
  description: string | null;
  goal: WorkoutPlanGoal | null;
  level: WorkoutPlanLevel | null;
  durationWeeks: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exercises?: WorkoutPlanExercise[];
}

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
