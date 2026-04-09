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

export declare const ROLE_GROUP_VALUES: readonly UserRole[];
export declare const MUSCLE_GROUP_VALUES: readonly MuscleGroup[];
export declare const EXERCISE_CATEGORY_VALUES: readonly ExerciseCategory[];

export declare const MUSCLE_GROUP_LABELS_ES: Record<MuscleGroup, string>;
export declare const EXERCISE_CATEGORY_LABELS_ES: Record<
  ExerciseCategory,
  string
>;

export declare function getMuscleGroupLabelEs(
  muscleGroup: MuscleGroup,
): string;

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
  weightKg: number | null;
  heightCm: number | null;
  birthDate: string | null;
  emailVerifiedAt: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesListResponse {
  items: Exercise[];
  total: number;
  page: number;
  limit: number;
}
