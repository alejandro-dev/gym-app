import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { UpdateWorkoutPlanPayload } from "@/services/workoutPlanService";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Ruta API para actualizar un plan.
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as UpdateWorkoutPlanPayload;

      const data = await backendFetch(`/api/workout-plans/${id}`, {
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

// Ruta API para eliminar un plan.
export async function DELETE(_: Request, context: RouteContext) {
   try {
      const { id } = await context.params;

      const data = await backendFetch(`/api/workout-plans/${id}`, {
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