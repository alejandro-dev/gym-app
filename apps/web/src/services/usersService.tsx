import { fetchJson } from "./httpClient";
import type { User, UserRole, UsersListResponse } from "@gym-app/types";

export interface SearchUsersParams {
   page: number;
   limit: number;
   search?: string;
   role?: string;
};

export interface CreateUserPayload {
   email: string;
   username?: string;
   firstName?: string;
   lastName?: string;
   role: UserRole;
}

export interface UpdateUserPayload {
   username?: string | null;
   firstName?: string | null;
   lastName?: string | null;
   role: UserRole;
}

// Construye la URL para listar/buscar usuarios con paginación.
export function buildUsersSearchPath(params: SearchUsersParams = {
   page: 0,
   limit: 0,
   search: "",
   role: "",
}): string {
   const { page = 0, limit = 10, search = "", role = "" } = params;
   const queryParams = new URLSearchParams();

   if (search) queryParams.append("search", search);
   if (role) queryParams.append("role", role);

   queryParams.append("page", page.toString());
   queryParams.append("limit", limit.toString());

   const queryString = queryParams.toString();
   return `/api/users${queryString ? `?${queryString}` : ""}`;
}

// Función que realiza la búsqueda paginada de usuarios.
export async function searchUsers(params: SearchUsersParams): Promise<UsersListResponse> {
   return fetchJson<UsersListResponse>(buildUsersSearchPath(params), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
   });
}

// Función que crea un usuario.
export async function createUser(payload: CreateUserPayload): Promise<User> {
   return fetchJson<User>("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}

// Función que actualiza un usuario existente.
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
   return fetchJson<User>(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
   });
}

// Función que elimina un usuario existente.
export async function deleteUser(id: string): Promise<User> {
   return fetchJson<User>(`/api/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
   });
}
