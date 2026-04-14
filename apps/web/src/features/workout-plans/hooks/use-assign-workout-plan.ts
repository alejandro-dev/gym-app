"use client";

import * as React from "react";
import { toast } from "sonner";

import {
   EMPTY_ASSIGN_PLAN_FORM_VALUES,
   type AssignPlanFormValues,
} from "../components/assign-plan-dialog";
import type { AthleteOption } from "./use-athletes-options";
import type { WorkoutPlanViewModel } from "../components/types";

type UseAssignWorkoutPlanParams = {
   setPlans: React.Dispatch<React.SetStateAction<WorkoutPlanViewModel[]>>;
};

export function useAssignWorkoutPlan({ setPlans }: UseAssignWorkoutPlanParams) {
   const [selectedPlan, setSelectedPlan] =
      React.useState<WorkoutPlanViewModel | null>(null);
   const [isOpen, setIsOpen] = React.useState(false);
   const [values, setValues] = React.useState<AssignPlanFormValues>(
      EMPTY_ASSIGN_PLAN_FORM_VALUES,
   );

   const openAssign = (plan: WorkoutPlanViewModel) => {
      setSelectedPlan(plan);
      setValues({
         userId: plan.userId ?? "",
      });
      setIsOpen(true);
   };

   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) {
         setValues(EMPTY_ASSIGN_PLAN_FORM_VALUES);
         setSelectedPlan(null);
      }
   };

   const handleValueChange: React.ChangeEventHandler<HTMLInputElement> = (
      event,
   ) => {
      const { name, value } = event.target;
      setValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   const handleAthleteChange = (athlete: AthleteOption) => {
      setValues({
         userId: athlete.id,
      });
   };

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();
      if (!selectedPlan) return;

      const nextPlan = {
         ...selectedPlan,
         userId: values.userId.trim() || null,
         updatedAt: new Date().toISOString(),
      };

      setPlans((current) =>
         current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)),
      );
      setSelectedPlan(nextPlan);
      setIsOpen(false);
      setValues(EMPTY_ASSIGN_PLAN_FORM_VALUES);
      toast.success("Plan asignado en la vista");
   };

   return {
      isOpen,
      selectedPlan,
      values,
      handleOpenChange,
      handleAthleteChange,
      handleSubmit,
      handleValueChange,
      openAssign,
   };
}
