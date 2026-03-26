"use client";

import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/login.schema";
import { login } from "@/services/authService";

const EMPTY_CREDENTIALS: LoginInput = {
	email: "",
	password: "",
};

const LOGIN_ERROR_MESSAGES: StatusMessageMap = {
	401: "Incorrect email or password",
	403: "You cannot access this account",
};

export function useAuthLogin() {
	const router = useRouter();
	const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);

	const mutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			toast.success("Welcome back");
			setCredentials(EMPTY_CREDENTIALS);
			router.push(data.isAdmin ? "/admin/users" : "/dashboard");
		},
		onError: (error) => {
			toast.error(getStatusErrorMessage(error, LOGIN_ERROR_MESSAGES));
		},
	});

	const readData = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCredentials((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();

		const result = loginSchema.safeParse({
			email: credentials.email.trim(),
			password: credentials.password,
		});

		if (!result.success) {
			toast.warning(result.error.issues[0]?.message ?? "Invalid form");
			return;
		}

		await mutation.mutateAsync(result.data);
	};

	return {
		credentials,
		handleSubmit,
		isLoading: mutation.isPending,
		readData,
	};
}
