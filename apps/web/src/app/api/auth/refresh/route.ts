import { NextResponse } from "next/server";

import {
   REFRESH_TOKEN_COOKIE_NAME,
   clearSessionCookies,
   readRefreshTokenFromSetCookieHeader,
   setSessionCookies,
} from "@/lib/auth-cookies";

export async function POST(req: Request) {
   // Leemos el refresh token de la cookie que ya controla Next.
   const refreshToken = req.headers
      .get("cookie")
      ?.match(new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=([^;]+)`))?.[1];

   if (!refreshToken) {
      // Si ni siquiera tenemos refresh token, la sesión no se puede renovar.
      const response = NextResponse.json(
         { message: "Unauthorized", status: 401 },
         { status: 401 },
      );
      clearSessionCookies(response);
      return response;
   }

   try {
      // Pedimos a Nest un nuevo access token usando el refresh token actual.
      const res = await fetch(`${process.env.NEST_API_URL}/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }),
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const payload = isJson ? await res.json() : null;

      if (!res.ok) {
         // Si la API rechaza el refresh, invalidamos también la sesión local.
         const response = NextResponse.json(
            {
               message: payload?.message ?? "Unauthorized",
               status: res.status,
            },
            { status: res.status },
         );
         clearSessionCookies(response);
         return response;
      }

      const response = NextResponse.json(payload);
      // Nest puede rotar también el refresh token, así que lo copiamos si viene
      // actualizado en la respuesta.
      const nextRefreshToken = readRefreshTokenFromSetCookieHeader(res);
      setSessionCookies(response, payload, nextRefreshToken);

      return response;
   } catch (error) {
      console.error("Refresh API error:", error);

      const response = NextResponse.json(
         {
            message: "Service unavailable",
            status: 503,
         },
         { status: 503 },
      );
      clearSessionCookies(response);
      return response;
   }
}
