import { cookies } from "next/headers";
import {
   clearServerSessionCookies,
   readRefreshTokenFromSetCookieHeader,
   REFRESH_TOKEN_COOKIE_NAME,
   setServerSessionCookies,
   TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookies";
import { ErrorCode } from "./errors/ErrorCode";

export async function backendFetch<T>(path: string, options?: RequestInit): Promise<T> {
   // En server-side leemos la sesión desde las cookies que controla Next.
   const cookieStore = await cookies();
   const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
   const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

   // Función para hacer la petición al backend con el token de acceso actual.
   const makeRequest = (accessToken?: string) =>
      fetch(`${process.env.NEST_API_URL}${path}`, {
         ...options,
         headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
         cache: options?.cache ?? "no-store",
      });

   let res = await makeRequest(token);

   // Si el token de acceso expiró, intentamos renovarlo.
   if (res.status === 401 && refreshToken) {
      // Si el access token expiró, intentamos renovarlo una sola vez antes
      // de devolver el 401 al resto de la app.
      const refreshRes = await fetch(`${process.env.NEST_API_URL}/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken }),
         cache: "no-store",
      });

      if (refreshRes.ok) {
         const refreshPayload = await refreshRes.json();
         const nextRefreshToken = readRefreshTokenFromSetCookieHeader(refreshRes);

         try {
            // Si el contexto lo permite, persistimos los tokens renovados
            // para siguientes requests.
            setServerSessionCookies(cookieStore, refreshPayload, nextRefreshToken);
         } catch {
            // En Server Components el store puede ser readonly; reintentamos al menos esta request.
         }

         // Reintentamos la petición original ya con el access token renovado.
         res = await makeRequest(refreshPayload.accessToken);
      } else {
         try {
            clearServerSessionCookies(cookieStore);
         } catch {
            // Ignoramos si no podemos mutar cookies en este contexto.
         }
      }
   }

   const data = await res.json().catch(() => null);

   if (!res.ok) {
      throw new ErrorCode(
         data?.message || "Unexpected error",
         res.status
      );
   }

   return data;
}
