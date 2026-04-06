import { ErrorCode } from "@/services/errors/ErrorCode";

// Función que refresca la sesión si la respuesta del backend es 401.
async function refreshSession() {
   // El cliente nunca habla directamente con Nest para refrescar; delega en
   // la route handler de Next para mantener toda la gestión de cookies aquí.
   const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
   });

   return response.ok;
}

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
   let response = await fetch(input, init);

   if (
      response.status === 401 &&
      typeof input === "string" &&
      input !== "/api/auth/refresh"
   ) {
      // Ante un 401 hacemos un único intento de refresh y repetimos la llamada
      // original si la renovación salió bien.
      const refreshed = await refreshSession();

      if (refreshed) {
         response = await fetch(input, init);
      }
   }

   return parseJsonResponse<T>(response);
}
