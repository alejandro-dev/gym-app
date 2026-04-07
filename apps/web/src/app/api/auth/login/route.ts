import { NextResponse } from "next/server";
import {
   readRefreshTokenFromSetCookieHeader,
   setSessionCookies,
} from "@/lib/auth-cookies";

export async function POST(req: Request) {
   const body = await req.json();

   try{
      // Realizar la solicitud al backend de Spring Boot
      const res = await fetch(`${process.env.NEST_API_URL}/api/auth/login`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body)
      });

      // Obtener el tipo de contenido de la respuesta
      const contentType = res.headers.get("content-type");

      // Verificar si el tipo de contenido es JSON
      const isJson = contentType?.includes("application/json");

      // Extraer el payload de la respuesta
      const payload = isJson ? await res.json() : null;

      // Verificar si la respuesta es exitosa
      if (!res.ok) {
         return NextResponse.json(
            {
               error: payload?.message ?? "Authentication failed",
               status: res.status,
            },
            { status: res.status }
         );
      }

      // Si la autenticación es exitosa, establecer las cookies de sesión
      const response = NextResponse.json(payload);

      // Obtener el token de refresco de la cookie de sesión
      const refreshToken = readRefreshTokenFromSetCookieHeader(res);

      setSessionCookies(response, payload, refreshToken);

      return response;

   } catch (error) {
      console.error("Login API error:", error);

      return NextResponse.json(
         {
            error: "Service unavailable",
            status: 503,
         },
         { status: 503 }
      );
   }
}
