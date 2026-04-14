import { searchUsers } from "@/services/usersService";
import { useQuery } from "@tanstack/react-query";

export type AthleteOption = {
   id: string;
   name: string;
   email: string;
};

export default function useAthletesOptions() {
   return useQuery({
      queryKey: ["athletes-options"],
      queryFn: async (): Promise<AthleteOption[]> => {
         const athletes = await searchUsers({
            page: 0,
            limit: 50,
            role: "USER",
         });

         return athletes.items.map((user) => ({
            id: user.id,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
            email: user.email,
         }));
      },
   });
}