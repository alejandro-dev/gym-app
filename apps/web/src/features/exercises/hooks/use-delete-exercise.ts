"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { deleteExercise } from "@/services/exercisesService";
import type { Exercise } from "@gym-app/types";

const EXERCISE_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del ejercicio y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar ejercicios",
   409: "Ya existe un ejercicio con este nombre o slug",
};

export function useDeleteExercise() {
   const queryClient = useQueryClient();
   const [selectedExercise, setSelectedExercise] =
      React.useState<Exercise | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);

   const deleteMutation = useMutation({
      mutationFn: async (exerciseId: string) => deleteExercise(exerciseId),
      onSuccess: async () => {
         toast.success("Ejercicio eliminado correctamente");
         setIsOpen(false);
         setSelectedExercise(null);
         await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, EXERCISE_ERROR_MESSAGES));
      },
   });

   const openDelete = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) setSelectedExercise(null);
   };

   const handleConfirm = () => {
      if (!selectedExercise) return;
      deleteMutation.mutate(selectedExercise.id);
   };

   return {
      isDeleting: deleteMutation.isPending,
      isOpen,
      selectedExercise,
      handleConfirm,
      handleOpenChange,
      openDelete,
   };
}

