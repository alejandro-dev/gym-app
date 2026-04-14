"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logout } from "@/services/authService";

export function useAuthLogout() {
   const queryClient = useQueryClient();
   const router = useRouter();

   const mutation = useMutation({
      mutationFn: logout,
      onSuccess: async () => {
         await queryClient.clear();
         toast.success("Sesión cerrada");
         router.push("/login");
         router.refresh();
      },
      onError: () => {
         toast.error("No se pudo cerrar la sesión");
      },
   });

   return {
      isLoading: mutation.isPending,
      logout: mutation.mutateAsync,
   };
}
