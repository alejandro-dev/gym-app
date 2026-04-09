import { cookies } from "next/headers";
import type { User } from "@gym-app/types";
import {
   clearServerSessionCookies,
   readRefreshTokenFromSetCookieHeader,
   REFRESH_TOKEN_COOKIE_NAME,
   setServerSessionCookies,
   TOKEN_COOKIE_NAME,
} from "@/lib/auth-cookies";
import { ErrorCode } from "./errors/ErrorCode";

type RefreshSessionPayload = {
   accessToken: string;
   user?: User;
   refreshToken?: string | null;
};

// Para evitar que múltiples peticiones server-side disparen renovaciones simultáneas
const RECENT_REFRESH_TTL_MS = 5_000;

// Varias peticiones server-side pueden chocar cuando el access token expira
// al mismo tiempo. Guardamos aquí el refresh "en vuelo" para que todas
// reutilicen la misma renovación y no invaliden el refresh token rotado.
const inFlightRefreshRequests = new Map<string, Promise<RefreshSessionPayload | null>>();
const recentRefreshResults = new Map<
   string,
   { payload: RefreshSessionPayload; expiresAt: number }
>();

function getRecentRefreshResult(refreshToken: string) {
   const cachedResult = recentRefreshResults.get(refreshToken);

   if (!cachedResult) {
      return null;
   }

   if (cachedResult.expiresAt <= Date.now()) {
      recentRefreshResults.delete(refreshToken);
      return null;
   }

   return cachedResult.payload;
}

// Función que realiza la llamada a la API de refresh de tokens.
async function refreshServerSession(refreshToken: string) {
   const recentRefreshResult = getRecentRefreshResult(refreshToken);

   if (recentRefreshResult) {
      // Si ya acabamos de rotar este refresh token, reutilizamos el resultado
      // reciente. Esto cubre el caso secuencial en el que otra capa server-side
      // aún lee cookies antiguas antes de que Next pueda persistirlas.
      return recentRefreshResult;
   }

   const existingRefreshRequest = inFlightRefreshRequests.get(refreshToken);

   if (existingRefreshRequest) {
      // Si otra request ya está renovando esta sesión, esperamos su resultado
      // en lugar de volver a usar el mismo refresh token una segunda vez.
      return existingRefreshRequest;
   }

   const refreshRequest = (async (): Promise<RefreshSessionPayload | null> => {
      const refreshRes = await fetch(`${process.env.NEST_API_URL}/api/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken }),
         cache: "no-store",
      });

      if (!refreshRes.ok) {
         return null;
      }

      // La API puede rotar también el refresh token, así que devolvemos ambos
      // valores para que la capa web mantenga la sesión alineada.
      const refreshPayload = await refreshRes.json();
      const nextRefreshToken = readRefreshTokenFromSetCookieHeader(refreshRes);

      const payload = {
         ...refreshPayload,
         refreshToken: nextRefreshToken,
      };

      recentRefreshResults.set(refreshToken, {
         payload,
         expiresAt: Date.now() + RECENT_REFRESH_TTL_MS,
      });

      return payload;
   })();

   inFlightRefreshRequests.set(refreshToken, refreshRequest);

   try {
      return await refreshRequest;
   } finally {
      inFlightRefreshRequests.delete(refreshToken);
   }
}

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
      const refreshPayload = await refreshServerSession(refreshToken);

      if (refreshPayload) {
         try {
            // Si el contexto lo permite, persistimos los tokens renovados
            // para siguientes requests. En acciones/route handlers esto suele
            // funcionar; en algunos Server Components el store puede ser readonly.
            setServerSessionCookies(
               cookieStore,
               refreshPayload,
               refreshPayload.refreshToken,
            );
         } catch {
            // En Server Components el store puede ser readonly; reintentamos al menos esta request.
         }

         // Aunque no podamos escribir cookies en este contexto, sí podemos
         // completar esta petición usando el access token recién emitido.
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
