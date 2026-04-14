"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import {
   createExercise,
   type CreateExercisePayload,
   updateExercise,
   type UpdateExercisePayload,
} from "@/services/exercisesService";
import type { Exercise } from "@gym-app/types";
import {
   EMPTY_EXERCISE_FORM_VALUES,
   type ExerciseFormValues,
} from "../components/form-exercise";
import { exerciseSchema } from "../schemas/exercise.schema";

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

const EXERCISE_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del ejercicio y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar ejercicios",
   409: "Ya existe un ejercicio con este nombre o slug",
};

export function useExerciseForm() {
   const queryClient = useQueryClient();
   const [selectedExercise, setSelectedExercise] =
      React.useState<Exercise | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);
   const [values, setValues] = React.useState<ExerciseFormValues>(
      EMPTY_EXERCISE_FORM_VALUES,
   );

   const reset = () => {
      setSelectedExercise(null);
      setValues(EMPTY_EXERCISE_FORM_VALUES);
   };

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
         setIsOpen(false);
         reset();
         await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, EXERCISE_ERROR_MESSAGES));
      },
   });

   const openCreate = () => {
      reset();
      setIsOpen(true);
   };

   const openEdit = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setValues({
         name: exercise.name,
         slug: exercise.slug,
         description: exercise.description ?? "",
         instructions: exercise.instructions ?? "",
         muscleGroup: exercise.muscleGroup,
         category: exercise.category,
         equipment: exercise.equipment ?? "",
         isCompound: exercise.isCompound,
      });
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) reset();
   };

   const handleValueChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = event.target;
      setValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   const handleMuscleGroupChange = (
      muscleGroup: ExerciseFormValues["muscleGroup"],
   ) => {
      setValues((current) => ({
         ...current,
         muscleGroup,
      }));
   };

   const handleCategoryChange = (category: ExerciseFormValues["category"]) => {
      setValues((current) => ({
         ...current,
         category,
      }));
   };

   const handleIsCompoundChange = (isCompound: boolean) => {
      setValues((current) => ({
         ...current,
         isCompound,
      }));
   };

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      const result = exerciseSchema.safeParse({
         name: values.name.trim(),
         slug: values.slug.trim(),
         description: values.description.trim(),
         instructions: values.instructions.trim(),
         muscleGroup: values.muscleGroup,
         category: values.category,
         equipment: values.equipment.trim(),
         isCompound: values.isCompound,
      });

      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

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

   return {
      isOpen,
      isSaving: saveMutation.isPending,
      selectedExercise,
      values,
      handleCategoryChange,
      handleIsCompoundChange,
      handleMuscleGroupChange,
      handleOpenChange,
      handleSubmit,
      handleValueChange,
      openCreate,
      openEdit,
   };
}

