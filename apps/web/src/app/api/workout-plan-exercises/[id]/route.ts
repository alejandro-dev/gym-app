import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { UpdateWorkoutPlanExercisePayload } from "@/services/workoutPlanExercisesService";

type RouteContext = {
   params: Promise<{
      id: string;
   }>;
};

// Proxy server-side para actualizar un ejercicio asignado a un plan.
export async function PATCH(req: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const body = (await req.json()) as UpdateWorkoutPlanExercisePayload;
      const data = await backendFetch(`/api/workout-plan-exercises/${id}`, {
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

// Proxy server-side para eliminar un ejercicio asignado a un plan.
export async function DELETE(_: Request, context: RouteContext) {
   try {
      const { id } = await context.params;
      const data = await backendFetch(`/api/workout-plan-exercises/${id}`, {
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
