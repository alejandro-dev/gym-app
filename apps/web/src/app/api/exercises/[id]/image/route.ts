import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Ruta API para actualizar la imagen de un ejercicio.
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const formData = await req.formData();

      const data = await backendFetch(`/api/exercises/${id}/image`, {
         method: "PATCH",
         body: formData,
      });

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }

      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}
