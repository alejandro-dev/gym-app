import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { CreateExercisePayload } from "@/services/exercisesService";
import { NextResponse } from "next/server";

// Ruta API para obtener la lista de ejercicios.
export async function GET(req: Request) {
   try {
      // Obtenemos los parámetros de búsqueda de ejercicios.
      const { searchParams } = new URL(req.url);

      // Construimos la URL de la API de búsqueda de usuejerciciosarios.
      const queryParams = new URLSearchParams({
         page: searchParams.get("page") ?? "0",
         limit: searchParams.get("limit") ?? "10",
         search: searchParams.get("search") ?? "",
      });

      const path = `/api/exercises?${queryParams.toString()}`;

      const data = await backendFetch(path);
      return NextResponse.json(data);

   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }
      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}

// Ruta API para crear un nuevo ejercicio.
export async function POST(req: Request) {
   try {
      const body = (await req.json()) as CreateExercisePayload;

      const data = await backendFetch("/api/exercises", {
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
