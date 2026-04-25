import { ProfileView } from "@/features/profile/components/profile-view"
import { requireUser } from "@/lib/authorize"

export default async function ProfilePage() {
   const user = await requireUser()

   return <ProfileView initialUser={user} />
}
