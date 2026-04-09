import { forbidden, redirect } from "next/navigation";

import UsersView from "@/features/users/views/users-view";
import { requireRoles } from "@/lib/authorize";
import { ErrorCode } from "@/services/errors/ErrorCode";
import { searchUsers } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
   await requireRoles(["ADMIN", "COACH"]);

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
         <UsersView initialData={initialData} />
      </div>
   )
}
