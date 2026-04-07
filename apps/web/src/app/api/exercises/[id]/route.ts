import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { UpdateExercisePayload } from "@/services/exercisesService";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Ruta API para actualizar un ejercicio.
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as UpdateExercisePayload;

      const data = await backendFetch(`/api/exercises/${id}`, {
         method: "PATCH",
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

// Ruta API para eliminar un ejercicio.
export async function DELETE(_: Request, context: RouteContext) {
   try {
      const { id } = await context.params;

      const data = await backendFetch(`/api/exercises/${id}`, {
         method: "DELETE",
      });

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }

      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}
