import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { ChangeStatusUserPayload } from "@/services/usersService";
import { NextResponse } from "next/server";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Ruta API para modificar el estado de un usuario.
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as ChangeStatusUserPayload;

      const data = await backendFetch(`/api/users/${id}/status`, {
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