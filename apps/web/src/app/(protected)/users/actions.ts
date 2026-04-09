"use server";

import { backendFetch } from "@/services/backend";
import type { UsersListResponse } from "@gym-app/types";

type SearchUsersParams = {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
};

// Función que realiza la llamada paginada a la API de usuarios.
export async function searchUsers({
	page = 0,
	limit = 10,
	search = "",
	role = "",
}: SearchUsersParams = {}): Promise<UsersListResponse> {
	const searchParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		search: search ?? "",
		role: role ?? "",
	});

	return backendFetch(`/api/users?${searchParams.toString()}`);
}
