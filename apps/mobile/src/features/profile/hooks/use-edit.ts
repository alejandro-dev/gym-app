import { Alert } from "react-native";
import { useLogoutMutation } from "../mutations/use-logout-mutation";
import { router } from "expo-router";

export function useEdit() {
   // Formulario para cerrar sesión del usuario
   const logoutMutation = useLogoutMutation();

   // Función para cerrar sesión del usuario
   const handleLogout = async () => {
      try {
         await logoutMutation.mutateAsync();

         // Redireccionar al inicio de sesión
         router.replace('/login');
      } catch (error) {
         const message =
            error instanceof Error ? error.message : 'No se pudo actualizar el perfil';

         Alert.alert('Error', message);
      }
   };
   
   return { 
      isLoggingOut: logoutMutation.isPending,
      handleLogout 
   };
}