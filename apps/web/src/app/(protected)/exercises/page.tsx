import ExercisesView from "@/features/exercises/views/exercises-view";
import { searchExercises } from "./actions";
import { requireRoles } from "@/lib/authorize";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { forbidden, redirect } from "next/navigation";

export default async function ExercisesPage() {
   await requireRoles(["ADMIN", "COACH"]);
   
   let initialData;

   try {
      initialData = await searchExercises({ page: 0, limit: 10, search: "" });
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
         <ExercisesView initialData={initialData} />
      </div>
   )
}