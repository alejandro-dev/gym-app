"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import {
   createUser,
   type CreateUserPayload,
   type UpdateUserPayload,
   updateUser,
} from "@/services/usersService";
import type { User } from "@gym-app/types";
import {
   EMPTY_USER_FORM_VALUES,
   type UserFormValues,
} from "../components/form-user";
import { userSchema } from "../schemas/user.schema";

type SaveUserMutationInput =
   | {
        mode: "create";
        payload: CreateUserPayload;
     }
   | {
        mode: "edit";
        userId: string;
        payload: UpdateUserPayload;
     };

const USER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del usuario y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar usuarios",
   409: "Ya existe un usuario con este correo electrónico o nombre de usuario",
};

export function useUserForm() {
   const queryClient = useQueryClient();
   const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);
   const [values, setValues] = React.useState<UserFormValues>(
      EMPTY_USER_FORM_VALUES,
   );

   const reset = () => {
      setSelectedUser(null);
      setValues(EMPTY_USER_FORM_VALUES);
   };

   const saveMutation = useMutation({
      mutationFn: async (input: SaveUserMutationInput) => {
         if (input.mode === "create") {
            return createUser(input.payload);
         }

         return updateUser(input.userId, input.payload);
      },
      onSuccess: async (_, input) => {
         toast.success(
            input.mode === "create"
               ? "Usuario creado correctamente"
               : "Usuario actualizado correctamente",
         );
         setIsOpen(false);
         reset();
         await queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   const openCreate = () => {
      reset();
      setIsOpen(true);
   };

   const openEdit = (user: User) => {
      setSelectedUser(user);
      setValues({
         email: user.email,
         username: user.username ?? "",
         firstName: user.firstName ?? "",
         lastName: user.lastName ?? "",
         role: user.role,
      });
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) reset();
   };

   const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   const handleRoleChange = (role: UserFormValues["role"]) => {
      setValues((current) => ({
         ...current,
         role,
      }));
   };

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      const result = userSchema.safeParse({
         email: values.email.trim(),
         username: values.username.trim() || undefined,
         firstName: values.firstName.trim() || undefined,
         lastName: values.lastName.trim() || undefined,
         role: values.role,
      });

      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

      if (selectedUser) {
         void saveMutation.mutateAsync({
            mode: "edit",
            userId: selectedUser.id,
            payload: {
               username: result.data.username ?? null,
               firstName: result.data.firstName ?? null,
               lastName: result.data.lastName ?? null,
               role: result.data.role,
            },
         });

         return;
      }

      void saveMutation.mutateAsync({
         mode: "create",
         payload: {
            email: result.data.email,
            username: result.data.username,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            role: result.data.role,
         },
      });
   };

   return {
      isOpen,
      isSaving: saveMutation.isPending,
      selectedUser,
      values,
      handleOpenChange,
      handleRoleChange,
      handleSubmit,
      handleValueChange,
      openCreate,
      openEdit,
   };
}

