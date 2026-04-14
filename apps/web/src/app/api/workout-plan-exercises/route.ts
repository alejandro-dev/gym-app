import { NextResponse } from "next/server";

import { backendFetch } from "@/services/backend";
import { ErrorCode } from "@/services/errors/ErrorCode";
import type { WorkoutPlanExercisePayload } from "@/services/workoutPlanExercisesService";

// Proxy server-side para listar ejercicios asignados a planes.
export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url);
      const queryParams = new URLSearchParams({
         userId: searchParams.get("userId") ?? "",
         workoutPlanId: searchParams.get("workoutPlanId") ?? "",
      });

      const data = await backendFetch(
         `/api/workout-plan-exercises?${queryParams.toString()}`,
      );

      return NextResponse.json(data);
   } catch (e) {
      if (e instanceof ErrorCode) {
         return NextResponse.json({ message: e.message }, { status: e.status });
      }

      return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
   }
}

// Proxy server-side para crear un ejercicio dentro de un plan.
export async function POST(req: Request) {
   try {
      const body = (await req.json()) as WorkoutPlanExercisePayload;
      const data = await backendFetch("/api/workout-plan-exercises", {
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
