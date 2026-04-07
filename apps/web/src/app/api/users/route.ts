import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { CreateUserPayload } from "@/services/usersService";
import { NextResponse } from "next/server";

// Ruta API para obtener la lista de usuarios con paginación.
export async function GET(req: Request) {
   try {
      // Obtenemos los parámetros de búsqueda de usuarios.
      const { searchParams } = new URL(req.url);

      // Construimos la URL de la API de búsqueda de usuarios.
      const queryParams = new URLSearchParams({
         page: searchParams.get("page") ?? "0",
         limit: searchParams.get("limit") ?? "10",
         search: searchParams.get("search") ?? "",
      });

      const path = `/api/users?${queryParams.toString()}`;

      const data = await backendFetch(path);
      return NextResponse.json(data);

   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }
      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}

// Ruta API para crear un nuevo usuario.
export async function POST(req: Request) {
   try {
      const body = (await req.json()) as CreateUserPayload;

      const data = await backendFetch("/api/users", {
         method: "POST",
         body: JSON.stringify(body),
      });

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }
      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}
