"use client";

import * as React from "react";
import { toast } from "sonner";

import {
   EMPTY_ASSIGN_PLAN_FORM_VALUES,
   type AssignPlanFormValues,
} from "../components/assign-plan-dialog";
import type { AthleteOption } from "./use-athletes-options";
import type { WorkoutPlanViewModel } from "../components/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getStatusErrorMessage, StatusMessageMap } from "@/features/auth/lib/auth-errors";
import { assignUser, AssignUserPayload } from "@/services/workoutPlanService";
import { toWorkoutPlanViewModel } from "./use-workout-plans-state";

type UseAssignWorkoutPlanParams = {
   setPlans: React.Dispatch<React.SetStateAction<WorkoutPlanViewModel[]>>;
};

type SaveAssignUserMutationInput = {
   planId: string;
   payload: AssignUserPayload;
};

const WORKOUT_PLAN_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del plan y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar planes",
   409: "Ya existe un recurso relacionado que entra en conflicto",
};

export function useAssignWorkoutPlan({ setPlans }: UseAssignWorkoutPlanParams) {
   const queryClient = useQueryClient();
   const [selectedPlan, setSelectedPlan] =
      React.useState<WorkoutPlanViewModel | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);
   const [values, setValues] = React.useState<AssignPlanFormValues>(
      EMPTY_ASSIGN_PLAN_FORM_VALUES,
   );

   // Abre el diálogo de asignación para un plan específico.
   const openAssign = (plan: WorkoutPlanViewModel) => {
      setSelectedPlan(plan);
      setValues({
         userId: plan.userId ?? "",
      });
      setIsOpen(true);
   };

   // Evento que se activa cuando el diálogo se abre o cierra.
   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) {
         setValues(EMPTY_ASSIGN_PLAN_FORM_VALUES);
         setSelectedPlan(null);
      }
   };

   // Evento que se activa cuando se cambia el valor de un campo de selección.
   const handleAthleteChange = (athlete: AthleteOption) => {
      setValues({
         userId: athlete.id,
      });
   };

   // Asigna el plan seleccionado al usuario.
   const saveMutation = useMutation({
      mutationFn: async (input: SaveAssignUserMutationInput) => {
         // Asignamos el plan al usuario.
         return assignUser(input.planId, input.payload);
      },
      onSuccess: async (savedPlan) => {
         const nextPlan = toWorkoutPlanViewModel(savedPlan);

         setPlans((current) =>
            current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)),
         );
         setSelectedPlan(nextPlan);
         setIsOpen(false);
         setValues(EMPTY_ASSIGN_PLAN_FORM_VALUES);
         toast.success("Plan asignado en la vista");

         // Actualizamos la lista de planes.
         await queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, WORKOUT_PLAN_ERROR_MESSAGES));
      },
   });

   // Evento que se activa cuando se envía el formulario.
   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();
      if (!selectedPlan) return;

      // Asignamos el plan al usuario.
      const userIdSelected = values.userId.trim();

      saveMutation.mutate({
         planId: selectedPlan.id,
         payload: {
            userId: userIdSelected,
         },
      });
   };

   return {
      isOpen,
      isSaving: saveMutation.isPending,
      selectedPlan,
      values,
      handleOpenChange,
      handleAthleteChange,
      handleSubmit,
      openAssign,
   };
}
