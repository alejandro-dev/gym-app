import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { ChangeStatusUserPayload, changeUserStatus } from "@/services/usersService";
import { User } from "@gym-app/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type ChangeStatusUserMutationInput = {
   userId: string;
   payload: ChangeStatusUserPayload;
};

const USER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del usuario y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar usuarios",
   409: "Ya existe un usuario con este correo electrónico o nombre de usuario",
};

export function useChangeStatusUser() {
   const queryClient = useQueryClient();
   const [selectedUser, setSelectedUser] = useState<User | null>(null);
   const [isOpen, setIsOpen] = useState(false);

   const changeStatusMutation = useMutation({
      mutationFn: async (input: ChangeStatusUserMutationInput) => {
         return changeUserStatus(input.userId, input.payload);
      },
      onSuccess: async () => {
         toast.success("Estado del usuario actualizado correctamente");
         setIsOpen(false);
         setSelectedUser(null);
         await queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   const openChange = (user: User) => {
      setSelectedUser(user);
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) setSelectedUser(null);
   };

   const handleConfirm = () => {
      if (!selectedUser) return;
      void changeStatusMutation.mutateAsync({
         userId: selectedUser.id,
         payload: {
            isActive: !selectedUser.isActive,
         },
      });
   };

   return {
      isConfirming: changeStatusMutation.isPending,
      isOpen,
      selectedUser,
      handleConfirm,
      handleOpenChange,
      openChange,
   };
}