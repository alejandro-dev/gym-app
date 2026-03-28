import { fetchJson } from "@/services/httpClient";
import type { User } from "@gym-app/types";

// Respuesta mínima esperada al iniciar sesión.
export interface LoginResponse {
   user: User;
   accessToken: string;
}

export interface AuthLoginInput {
   email: string;
   password: string;
}

export interface AuthRegisterInput {
   email: string;
   password: string;
   username?: string;
   firstName?: string;
   lastName?: string;
   weightKg?: number;
   heightCm?: number;
   birthDate?: string;
}

// Respuesta genérica para endpoints auth sin contrato fuerte en frontend.
export interface AuthMessageResponse {
   message?: string;
}

export interface AuthVerifyEmailInput {
   token: string;
}

export async function login(input: AuthLoginInput) {
   return fetchJson<LoginResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
   });
}

export async function register(input: AuthRegisterInput) {
   return fetchJson<AuthMessageResponse>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
   });
}

export async function verifyEmail(input: AuthVerifyEmailInput) {
   return fetchJson<AuthMessageResponse>("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
   });
}
