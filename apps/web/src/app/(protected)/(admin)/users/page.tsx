import { forbidden, redirect } from "next/navigation";

import UsersView from "@/features/users/views/users-view";
import { requireUser } from "@/lib/authorize";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { searchUsers } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
   // Obtenemos el usuario autenticado para determinar el acceso.
   const user = await requireUser();

   if (user.role !== "ADMIN") {
      forbidden();
   }

   let initialData;

   try {
      initialData = await searchUsers({ page: 0, limit: 10, search: "", role: "" });
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
         <UsersView initialData={initialData} currentUserRole={user.role} />
      </div>
   )
}
