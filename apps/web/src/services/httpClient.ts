import { ErrorCode } from "@/services/errors/ErrorCode";

// Convierte respuestas HTTP JSON al tipo esperado y homologa errores de API.
export async function parseJsonResponse<T>(response: Response): Promise<T> {
   const data = await response.json().catch(() => null);

   if (!response.ok) {
      throw new ErrorCode(data?.message || "Unexpected error", response.status);
   }

   return data as T;
}

// Helper común para reducir duplicación de fetch + parseo de respuesta JSON.
export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
   const response = await fetch(input, init);
   return parseJsonResponse<T>(response);
}
