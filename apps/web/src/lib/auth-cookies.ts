import { NextResponse } from "next/server";
import type { User } from "@gym-app/types";

const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const TOKEN_COOKIE_NAME = "token";
export const ROLE_COOKIE_NAME = "role";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

type CookieStoreLike = {
   set: (name: string, value: string, options?: Record<string, unknown>) => unknown;
   delete: (name: string) => unknown;
};

type AuthPayload = {
   accessToken: string;
   user?: User;
};

// Función para obtener las opciones comunes de las cookies de sesión.
function getCookieOptions() {
   // Centralizamos aquí las opciones para que access token, role y refresh token
   // tengan el mismo ciclo de vida dentro de la capa web.
   return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
   };
}

// Lee el token de acceso de la cookie de sesión.
export function readRefreshTokenFromSetCookieHeader(response: Response) {
   // Nest escribe el refresh token en Set-Cookie. Como la respuesta del backend
   // no llega directamente al navegador, necesitamos extraerlo para volver a
   // guardarlo desde el front.
   const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
   const setCookieHeaders = getSetCookie
      ? getSetCookie()
      : response.headers.get("set-cookie")
         ? [response.headers.get("set-cookie") as string]
         : [];

   for (const header of setCookieHeaders) {
      const match = header.match(/(?:^|,\s*)refreshToken=([^;]+)/);

      if (match?.[1]) {
         return decodeURIComponent(match[1]);
      }
   }

   return null;
}

// Establece las cookies de sesión en la respuesta.
export function setSessionCookies(
   response: NextResponse,
   payload: AuthPayload,
   refreshToken?: string | null,
) {
   // Estas cookies son la "sesión web" que maneja Next. No dependen de que
   // el navegador vea las cookies originales emitidas por la API.
   const cookieOptions = getCookieOptions();

   response.cookies.set(TOKEN_COOKIE_NAME, payload.accessToken, cookieOptions);

   if (typeof payload.user?.role === "string") {
      response.cookies.set(
         ROLE_COOKIE_NAME,
         payload.user.role.toLowerCase(),
         cookieOptions,
      );
   }

   if (refreshToken) {
      response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);
   }
}

// Establece las cookies de sesión en el contexto de la API.
export function setServerSessionCookies(
   cookieStore: CookieStoreLike,
   payload: AuthPayload,
   refreshToken?: string | null,
) {
   // Misma idea que setSessionCookies, pero para contextos server donde
   // mutamos el cookie store directamente en lugar de construir un response.
   const cookieOptions = getCookieOptions();

   cookieStore.set(TOKEN_COOKIE_NAME, payload.accessToken, cookieOptions);

   if (typeof payload.user?.role === "string") {
      cookieStore.set(
         ROLE_COOKIE_NAME,
         payload.user.role.toLowerCase(),
         cookieOptions,
      );
   }

   if (refreshToken) {
      cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);
   }
}

// Limpia las cookies de sesión en la respuesta.
export function clearSessionCookies(response: NextResponse) {
   // Si refresh falla o la sesión ya no es válida, limpiamos todo el estado
   // local de autenticación para no dejar cookies incoherentes.
   response.cookies.delete(TOKEN_COOKIE_NAME);
   response.cookies.delete(ROLE_COOKIE_NAME);
   response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
}

// Limpia las cookies de sesión en el contexto de la API.
export function clearServerSessionCookies(cookieStore: CookieStoreLike) {
   cookieStore.delete(TOKEN_COOKIE_NAME);
   cookieStore.delete(ROLE_COOKIE_NAME);
   cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}
