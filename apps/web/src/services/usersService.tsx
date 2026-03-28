import { fetchJson } from "./httpClient";
import type { UsersListResponse } from "@gym-app/types";

type SearchUsersParams = {
   page: number;
   limit: number;
};

// Función que realiza la búsqueda paginada de usuarios.
export async function searchUsers({
   page,
   limit,
}: SearchUsersParams): Promise<UsersListResponse> {
   const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
   });

   return fetchJson(`/api/users?${searchParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
   });
}
