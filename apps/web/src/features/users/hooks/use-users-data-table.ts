"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
   getCoreRowModel,
   useReactTable,
   type ColumnDef,
   type PaginationState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import {
   EMPTY_USER_FORM_VALUES,
   type UserFormValues,
} from "../components/form-user";
import { userSchema } from "../schemas/user.schema";
import {
   createUser,
   deleteUser,
   type CreateUserPayload,
   type UpdateUserPayload,
   updateUser,
} from "@/services/usersService";
import type { User } from "@gym-app/types";

type UseUsersDataTableParams<TData> = {
   columns: ColumnDef<TData>[];
   data: TData[];
   getRowId: (row: TData) => string;
   pagination: PaginationState;
   pageCount: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

// Tipo para los datos de la mutación de guardar un usuario.
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

// Errores de validación y permisos relacionados con usuarios.
const USER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del usuario y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar usuarios",
   409: "Ya existe un usuario con este correo electrónico o nombre de usuario",
};

export function useUsersDataTable<TData>({
   columns,
   data,
   getRowId,
   pagination,
   pageCount,
   onPaginationChange,
}: UseUsersDataTableParams<TData>) {
   const queryClient = useQueryClient();
   const [selectedUser, setSelectedUser] = useState<User | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [formValues, setFormValues] = useState<UserFormValues>(EMPTY_USER_FORM_VALUES);

   // Restablece el usuario seleccionado y los valores del formulario.
   const resetForm = () => {
      setSelectedUser(null);
      setFormValues(EMPTY_USER_FORM_VALUES);
   };

   // Mutación para crear o actualizar un usuario.
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
         setIsDialogOpen(false);
         resetForm();

         // Realizamos la llamada de consulta de usuarios para actualizar la tabla.
         await queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   // Mutación para eliminar un usuario existente.
   const deleteMutation = useMutation({
      mutationFn: async (userId: string) => deleteUser(userId),
      onSuccess: async () => {
         toast.success("Usuario eliminado correctamente");
         setIsDeleteDialogOpen(false);
         resetForm();

         // Realizamos la llamada de consulta de usuarios para actualizar la tabla.
         await queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   // Abre el diálogo para crear un nuevo usuario.
   const openCreateDialog = () => {
      resetForm();
      setIsDialogOpen(true);
   };

   // Abre el diálogo para editar un usuario existente.
   const openEditDialog = (user: User) => {
      setSelectedUser(user);
      setFormValues({
         email: user.email,
         username: user.username ?? "",
         firstName: user.firstName ?? "",
         lastName: user.lastName ?? "",
         role: user.role,
      });
      setIsDialogOpen(true);
   };

   // Abre el diálogo de confirmación para eliminar un usuario.
   const openDeleteDialog = (user: User) => {
      setSelectedUser(user);
      setIsDeleteDialogOpen(true);
   };

   // Evento que se activa cuando cambia el estado del diálogo de crear/editar.
   const handleDialogOpenChange = (open: boolean) => {
      setIsDialogOpen(open);

      if (!open && !isDeleteDialogOpen) {
         resetForm();
      }
   };

   // Evento que se activa cuando cambia el estado del diálogo de borrado.
   const handleDeleteDialogOpenChange = (open: boolean) => {
      setIsDeleteDialogOpen(open);

      if (!open && !isDialogOpen) {
         resetForm();
      }
   };

   // Evento que se activa cuando cambia el valor de un campo del formulario.
   const handleFormValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setFormValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   // Evento que se activa cuando cambia el rol del usuario.
   const handleRoleChange = (role: UserFormValues["role"]) => {
      setFormValues((current) => ({
         ...current,
         role,
      }));
   };

   // Evento que se activa al enviar el formulario de creación/edición.
   const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validamos el formulario con Zod.
      const result = userSchema.safeParse({
         email: formValues.email.trim(),
         username: formValues.username.trim() || undefined,
         firstName: formValues.firstName.trim() || undefined,
         lastName: formValues.lastName.trim() || undefined,
         role: formValues.role,
      });

      // Si el formulario no es válido, mostramos el primer error.
      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

      // Si hay un usuario seleccionado, actualizamos en lugar de crear.
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

      // Si no estamos editando un usuario, creamos uno nuevo.
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

   // Confirma la eliminación del usuario actualmente seleccionado.
   const handleDeleteUser = () => {
      if (!selectedUser) {
         return;
      }

      void deleteMutation.mutateAsync(selectedUser.id);
   };

   // Configuración base de la tabla con paginación manual.
   const table = useReactTable({
      data,
      columns,
      state: {
         pagination,
      },
      pageCount,
      manualPagination: true,
      getRowId,
      onPaginationChange,
      getCoreRowModel: getCoreRowModel(),
   });

   return {
      formValues,
      isDeleting: deleteMutation.isPending,
      isDialogOpen,
      isDeleteDialogOpen,
      isSaving: saveMutation.isPending,
      selectedUser,
      table,
      handleCreateUser,
      handleDeleteDialogOpenChange,
      handleDeleteUser,
      handleDialogOpenChange,
      handleFormValueChange,
      handleRoleChange,
      openCreateDialog,
      openDeleteDialog,
      openEditDialog,
   };
}
