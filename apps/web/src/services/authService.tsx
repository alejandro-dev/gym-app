import { fetchJson } from "@/services/httpClient";

// Respuesta mínima esperada al iniciar sesión.
export interface LoginResponse {
   isAdmin: boolean;
   token?: string;
}

export interface AuthLoginInput {
   email: string;
   password: string;
}

export interface AuthRegisterInput {
   username: string;
   email: string;
   password: string;
   familyName: string;
   birthDate?: string;
}

// Respuesta genérica para endpoints auth sin contrato fuerte en frontend.
export interface AuthMessageResponse {
   message?: string;
}

export async function login(input: AuthLoginInput) {
   return fetchJson<LoginResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
   });
}
