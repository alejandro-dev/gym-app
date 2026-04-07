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
   EMPTY_EXERCISE_FORM_VALUES,
   type ExerciseFormValues,
} from "../components/form-exercise";
import { exerciseSchema } from "../schemas/exercise.schema";
import type { Exercise } from "@gym-app/types";
import { createExercise, CreateExercisePayload, deleteExercise, updateExercise, UpdateExercisePayload } from "@/services/exercisesService";

type UseExercisesDataTableParams<TData> = {
   columns: ColumnDef<TData>[];
   data: TData[];
   getRowId: (row: TData) => string;
   pagination: PaginationState;
   pageCount: number;
   onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
};

// Tipo para los datos de la mutación de guardar un ejercicio.
type SaveExerciseMutationInput =
   | {
        mode: "create";
        payload: CreateExercisePayload;
     }
   | {
        mode: "edit";
        exerciseId: string;
        payload: UpdateExercisePayload;
     };

// Errores de validación y permisos relacionados con ejercicios.
const USER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del ejercicio y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar ejercicios",
   409: "Ya existe un ejercicio con este nombre o slug",
};

export function useExercisesDataTable<TData>({
   columns,
   data,
   getRowId,
   pagination,
   pageCount,
   onPaginationChange,
}: UseExercisesDataTableParams<TData>) {
   const queryClient = useQueryClient();
   const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [formValues, setFormValues] = useState<ExerciseFormValues>(EMPTY_EXERCISE_FORM_VALUES);

   // Restablece el ejercicio seleccionado y los valores del formulario.
   const resetForm = () => {
      setSelectedExercise(null);
      setFormValues(EMPTY_EXERCISE_FORM_VALUES);
   };

   // Mutación para crear o actualizar un ejercicio.
   const saveMutation = useMutation({
      mutationFn: async (input: SaveExerciseMutationInput) => {
         if (input.mode === "create") {
            return createExercise(input.payload);
         }

         return updateExercise(input.exerciseId, input.payload);
      },
      onSuccess: async (_, input) => {
         toast.success(
            input.mode === "create"
               ? "Ejercicio creado correctamente"
               : "Ejercicio actualizado correctamente",
         );
         setIsDialogOpen(false);
         resetForm();

         // Realizamos la llamada de consulta de ejercicios para actualizar la tabla.
         await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   // Mutación para eliminar un ejercicio existente.
   const deleteMutation = useMutation({
      mutationFn: async (exerciseId: string) => deleteExercise(exerciseId),
      onSuccess: async () => {
         toast.success("Ejercicio eliminado correctamente");
         setIsDeleteDialogOpen(false);
         resetForm();

         // Realizamos la llamada de consulta de ejercicios para actualizar la tabla.
         await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, USER_ERROR_MESSAGES));
      },
   });

   // Abre el diálogo para crear un nuevo ejercicio.
   const openCreateDialog = () => {
      resetForm();
      setIsDialogOpen(true);
   };

   // Abre el diálogo para editar un ejercicio existente.
   const openEditDialog = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setFormValues({
         name: exercise.name,
         slug: exercise.slug,
         description: exercise.description ?? "",
         instructions: exercise.instructions  ?? "",
         muscleGroup: exercise.muscleGroup,
         category: exercise.category,
         equipment: exercise.equipment ?? "",
         isCompound: exercise.isCompound,
      });
      setIsDialogOpen(true);
   };

   // Abre el diálogo de confirmación para eliminar un ejercicio.
   const openDeleteDialog = (exercise: Exercise) => {
      setSelectedExercise(exercise);
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
   const handleFormValueChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = e.target;

      setFormValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   // Evento que se activa cuando cambia el grupo muscular del ejercicio.
   const handleMuscleGroupChange = (muscleGroup: ExerciseFormValues["muscleGroup"]) => {
      setFormValues((current) => ({
         ...current,
         muscleGroup,
      }));
   };
   
   // Evento que se activa cuando cambia la categoría del ejercicio.
   const handleCategoryChange = (category: ExerciseFormValues["category"]) => {
      setFormValues((current) => ({
         ...current,
         category,
      }));
   };

   // Evento que se activa cuando cambia si el ejercicio es compuesto.
   const handleIsCompoundChange = (isCompound: boolean) => {
      setFormValues((current) => ({
         ...current,
         isCompound,
      }));
   };

   // Evento que se activa al enviar el formulario de creación/edición.
   const handleCreateExercise = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validamos el formulario con Zod.
      const result = exerciseSchema.safeParse({
         name: formValues.name.trim(),
         slug: formValues.slug.trim(),
         description: formValues.description.trim(),
         instructions: formValues.instructions.trim(),
         muscleGroup: formValues.muscleGroup,
         category: formValues.category,
         equipment: formValues.equipment.trim(),
         isCompound: formValues.isCompound,
      });

      // Si el formulario no es válido, mostramos el primer error.
      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

      // Si hay un ejercicio seleccionado, actualizamos en lugar de crear.
      if (selectedExercise) {
         saveMutation.mutate({
            mode: "edit",
            exerciseId: selectedExercise.id,
            payload: {
               name: result.data.name,
               slug: result.data.slug,
               description: result.data.description,
               instructions: result.data.instructions,
               muscleGroup: result.data.muscleGroup,
               category: result.data.category,
               equipment: result.data.equipment,
               isCompound: result.data.isCompound,
            },
         });

         return;
      }

      // Si no estamos editando un ejercicio, creamos uno nuevo.
      saveMutation.mutate({
         mode: "create",
         payload: {
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description,
            instructions: result.data.instructions,
            muscleGroup: result.data.muscleGroup,
            category: result.data.category,
            equipment: result.data.equipment,
            isCompound: result.data.isCompound,
         },
      });
   };

   // Confirma la eliminación del ejercicio actualmente seleccionado.
   const handleDeleteExercise = () => {
      if (!selectedExercise) {
         return;
      }

      deleteMutation.mutate(selectedExercise.id);
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
      selectedExercise,
      table,
      handleCreateExercise,
      handleDeleteDialogOpenChange,
      handleDeleteExercise,
      handleDialogOpenChange,
      handleFormValueChange,
      handleMuscleGroupChange,
      handleCategoryChange,
      handleIsCompoundChange,
      openCreateDialog,
      openDeleteDialog,
      openEditDialog,
   };
}
