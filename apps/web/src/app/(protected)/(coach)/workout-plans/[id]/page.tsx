import { forbidden, redirect } from "next/navigation";

import { requireUser } from "@/lib/authorize";
import { ErrorCode } from "@/services/errors/ErrorCode";
import WorkoutPlanDetailView from "@/features/workout-plans/views/workout-plan-detail-view";
import {
   getExerciseCatalog,
   getWorkoutPlan,
   getWorkoutPlanExercises,
} from "./actions";

type WorkoutPlanDetailPageProps = {
   params: Promise<{
      id: string;
   }>;
};

export default async function WorkoutPlanDetailPage({
   params,
}: WorkoutPlanDetailPageProps) {
   const user = await requireUser();

   if (user.role !== "COACH") {
      forbidden();
   }

   const { id } = await params;

   // Se cargan en paralelo porque la vista compone datos de tres recursos:
   // el plan, sus WorkoutPlanExercise y el catálogo Exercise para el selector.
   let plan;
   let planExercises;
   let exerciseCatalog;

   try {
      [plan, planExercises, exerciseCatalog] = await Promise.all([
         getWorkoutPlan(id),
         getWorkoutPlanExercises(id),
         getExerciseCatalog(),
      ]);
   } catch (error) {
      if (error instanceof ErrorCode) {
         if (error.status === 401) {
            redirect("/login");
         }

         if (error.status === 403 || error.status === 404) {
            forbidden();
         }
      }

      throw error;
   }

   return (
      <WorkoutPlanDetailView
         availableExercises={exerciseCatalog}
         // Normalizamos campos opcionales para que la vista cliente no tenga que
         // conocer detalles de serialización o valores ausentes del backend.
         initialPlan={{
            ...plan,
            goal: plan.goal ? plan.goal : null,
            level: plan.level ? plan.level : null,
            durationWeeks: plan.durationWeeks ?? null,
            exercisesCount: planExercises.length,
            exercises: planExercises,
         }}
      />
   );
}
