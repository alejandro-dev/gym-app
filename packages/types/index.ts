export type UserRole = "USER" | "ADMIN" | "COACH";

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
