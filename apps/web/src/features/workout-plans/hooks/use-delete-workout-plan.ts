"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { deleteWorkoutPlan } from "@/services/workoutPlanService";
import { WorkoutPlanViewModel } from "../components/types";

const WORKOUT_PLAN_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del plan y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar planes",
   404: "Plan de entrenamiento no encontrado",
   409: "Ya existe un recurso relacionado que entra en conflicto",
};


type UseDeleteWorkoutPlanParams = {
   setPlans: React.Dispatch<React.SetStateAction<WorkoutPlanViewModel[]>>;
};

export function useDeleteWorkoutPlan({ setPlans }: UseDeleteWorkoutPlanParams) {
   const queryClient = useQueryClient();
   const [selectedWorkoutPlan, setSelectedWorkoutPlan] =
      React.useState<WorkoutPlanViewModel | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);

   const deleteMutation = useMutation({
      mutationFn: async (workoutPlanId: string) => deleteWorkoutPlan(workoutPlanId),
      onSuccess: async (_deletedWorkoutPlan, workoutPlanId) => {
         toast.success("Plan eliminado correctamente");
         setPlans((current) =>
            current.filter((workoutPlan) => workoutPlan.id !== workoutPlanId),
         );
         setIsOpen(false);
         setSelectedWorkoutPlan(null);
         await queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, WORKOUT_PLAN_ERROR_MESSAGES));
      },
   });

   const openDelete = (workoutPlan: WorkoutPlanViewModel) => {
      setSelectedWorkoutPlan(workoutPlan);
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) setSelectedWorkoutPlan(null);
   };

   const handleConfirm = () => {
      if (!selectedWorkoutPlan) return;
      deleteMutation.mutate(selectedWorkoutPlan.id);
   };

   return {
      isDeleting: deleteMutation.isPending,
      isOpen,
      selectedWorkoutPlan,
      handleConfirm,
      handleOpenChange,
      openDelete,
   };
}
