import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { AssignUserPayload } from "@/services/workoutPlanService";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Ruta API para asignar un usuario a un plan de entrenamiento
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as AssignUserPayload;

      const data = await backendFetch(`/api/workout-plans/${id}/assign-user`, {
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
