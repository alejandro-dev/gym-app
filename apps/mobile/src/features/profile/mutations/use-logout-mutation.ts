import { logout } from "@/services/api/profileService";
import { removeAccessToken } from "@/services/storage/secure-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook para cerrar sesión del usuario
export function useLogoutMutation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: () => logout(),
      onSuccess: () => {
         // Eliminar el token de acceso del almacenamiento seguro
         removeAccessToken();

         // Limpiar la caché de React Query para eliminar cualquier dato relacionado con el usuario
         queryClient.clear();
      },
   });
}