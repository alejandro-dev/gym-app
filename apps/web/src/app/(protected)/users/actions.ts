"use server";

import { backendFetch } from "@/services/backend";
import type { UsersListResponse } from "@gym-app/types";

type SearchUsersParams = {
	page?: number;
	limit?: number;
};

// Función que realiza la llamada paginada a la API de usuarios.
export async function searchUsers({
	page = 0,
	limit = 10,
}: SearchUsersParams = {}): Promise<UsersListResponse> {
	const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
	});

	return backendFetch(`/users?${searchParams.toString()}`);
}
