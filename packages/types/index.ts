export type UserRole = "USER" | "ADMIN" | "COACH";
export type MuscleGroup = "CHEST" | "BACK" | "LEGS" | "SHOULDERS" | "ARMS" | "CORE" | "FULL_BODY" | "GLUTES" | "CALVES" | "CARDIO";
export type ExerciseCategory = "STRENGTH" | "BODYWEIGHT" | "CARDIO"

// Representa el usuario publico que devuelve la API.
// Las fechas llegan serializadas como string ISO en las respuestas JSON.
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
   createdAt: string;
   updatedAt: string;
}

export interface ExercisesListResponse {
   items: Exercise[];
   total: number;
   page: number;
   limit: number;
}
