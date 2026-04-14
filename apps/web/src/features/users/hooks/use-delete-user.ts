"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { deleteUser } from "@/services/usersService";
import type { User } from "@gym-app/types";

const USER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del usuario y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar usuarios",
   409: "Ya existe un usuario con este correo electrónico o nombre de usuario",
};

export function useDeleteUser() {
   const queryClient = useQueryClient();
   const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);

   const deleteMutation = useMutation({
      mutationFn: async (userId: string) => deleteUser(userId),
      onSuccess: async () => {
         toast.success("Usuario eliminado correctamente");
         setIsOpen(false);
         setSelectedUser(null);
         await queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   const openDelete = (user: User) => {
      setSelectedUser(user);
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) setSelectedUser(null);
   };

   const handleConfirm = () => {
      if (!selectedUser) return;
      void deleteMutation.mutateAsync(selectedUser.id);
   };

   return {
      isDeleting: deleteMutation.isPending,
      isOpen,
      selectedUser,
      handleConfirm,
      handleOpenChange,
      openDelete,
   };
}

