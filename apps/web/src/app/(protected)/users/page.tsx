import UsersView from "@/features/users/views/users-view";
import { searchUsers } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
   // Carga inicial de usuarios (SSR)
	const initialData = await searchUsers({ page: 0, limit: 10 });

   return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
         <UsersView initialData={initialData} />
      </div>
   )
}
