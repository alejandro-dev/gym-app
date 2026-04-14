import { requireUser } from "@/lib/authorize";
import { forbidden, redirect } from "next/navigation";
import { searchWorkoutPlans } from "./actions";
import { ErrorCode } from "@/services/errors/ErrorCode";
import WorkoutPlansView from "@/features/workout-plans/views/workout-plans-view";

export default async function Plans() {
   // Obtenemos el usuario autenticado para determinar el acceso.
   const user = await requireUser();

   if (user.role !== "COACH") {
      forbidden();
   }

   let initialData;

   try {
      initialData = await searchWorkoutPlans({ page: 0, limit: 10, search: "" });
      console.log(initialData);

   } catch (error) {
      if (error instanceof ErrorCode) {
         if (error.status === 401) {
            redirect("/login");
         }

         if (error.status === 403) {
            forbidden();
         }
      }

      throw error;
   }

   return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
         <WorkoutPlansView initialData={initialData} />
      </div>
   )
}