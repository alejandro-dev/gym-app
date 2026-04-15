"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";
import {
   createWorkoutPlan,
   type CreateWorkoutPlanPayload,
   updateWorkoutPlan,
   type UpdateWorkoutPlanPayload,
} from "@/services/workoutPlanService";
import {
   EMPTY_WORKOUT_PLAN_FORM_VALUES,
   type WorkoutPlanFormValues,
} from "../components/form-plan";
import type { WorkoutPlanViewModel } from "../components/types";
import { workoutPlanSchema } from "../schemas/workout-plan.schema";
import { toWorkoutPlanViewModel } from "./use-workout-plans-state";
import { useCallback, useState } from "react";

type UseWorkoutPlanFormParams = {
   setPlans: React.Dispatch<React.SetStateAction<WorkoutPlanViewModel[]>>;
};

type SaveWorkoutPlanMutationInput =
   | {
        mode: "create" | "duplicate";
        payload: CreateWorkoutPlanPayload;
     }
   | {
        mode: "edit";
        planId: string;
        payload: UpdateWorkoutPlanPayload;
     };

const WORKOUT_PLAN_ERROR_MESSAGES: StatusMessageMap = {
   400: "Revise los datos del plan y vuelva a intentarlo",
   401: "No tienes permiso para realizar esta acción",
   403: "No tienes permiso para administrar planes",
   409: "Ya existe un recurso relacionado que entra en conflicto",
};

export function useWorkoutPlanForm({ setPlans }: UseWorkoutPlanFormParams) {
   const queryClient = useQueryClient();
   const [selectedPlan, setSelectedPlan] =
      useState<WorkoutPlanViewModel | null>(null);
   const [isOpen, setIsOpen] = useState(false);
   const [mode, setMode] = useState<"create" | "edit" | "duplicate">(
      "create",
   );
   const [values, setValues] = useState<WorkoutPlanFormValues>(
      EMPTY_WORKOUT_PLAN_FORM_VALUES,
   );

   // Restablece los valores del formulario y la vista.
   const reset = useCallback(() => {
      setValues(EMPTY_WORKOUT_PLAN_FORM_VALUES);
      setSelectedPlan(null);
   }, []);

   // Guarda el plan de ejercicio.
   const saveMutation = useMutation({
      mutationFn: async (input: SaveWorkoutPlanMutationInput) => {
         // Si el plan es editado, actualizamos el plan existente.
         if (input.mode === "edit") {
            return updateWorkoutPlan(input.planId, input.payload);
         }

         // Si el plan es nuevo o una copia, lo creamos.
         return createWorkoutPlan(input.payload);
      },
      onSuccess: async (savedPlan, input) => {
         const nextPlan = toWorkoutPlanViewModel(savedPlan);

         setPlans((current) => {
            if (input.mode === "edit") {
               return current.map((plan) =>
                  plan.id === nextPlan.id ? nextPlan : plan,
               );
            }

            return [nextPlan, ...current];
         });

         toast.success(
            input.mode === "create"
               ? "Plan creado correctamente"
               : input.mode === "duplicate"
                 ? "Copia del plan creada correctamente"
                 : "Plan actualizado correctamente",
         );
         setIsOpen(false);
         reset();

         // Actualizamos la lista de planes.
         await queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, WORKOUT_PLAN_ERROR_MESSAGES));
      },
   });

   // Abre el formulario para crear un nuevo plan.
   const openCreate = () => {
      setMode("create");
      reset();
      setIsOpen(true);
   };

   // Abre el formulario para editar un plan existente.
   const openEdit = (plan: WorkoutPlanViewModel) => {
      setMode("edit");
      setSelectedPlan(plan);
      setValues(getFormValuesFromPlan(plan));
      setIsOpen(true);
   };

   // Abre el formulario para duplicar un plan existente.
   const openDuplicate = (plan: WorkoutPlanViewModel) => {
      setMode("duplicate");
      setSelectedPlan(plan);
      setValues({
         ...getFormValuesFromPlan(plan),
         name: `${plan.name} - copia`,
      });
      setIsOpen(true);
   };

   // Evento que se activa cuando cambia el estado del dialogo.
   const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) reset();
   };

   // Evento que se activa cuando cambia el valor de un campo.
   const handleValueChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = event.target;
      setValues((current) => ({
         ...current,
         [name]: value,
      }));
   };

   // Evento que se activa al enviar el formulario.
   const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      // Validamos el formulario.
      const result = workoutPlanSchema.safeParse({
         userId: values.userId.trim(),
         name: values.name.trim(),
         description: values.description,
         isActive: values.isActive === "true",
         goal: values.goal || null,
         level: values.level || null,
         durationWeeks: values.durationWeeks ? Number(values.durationWeeks) : null,
      });

      // Si el formulario no es válido, lanzamos una excepción.
      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Formulario inválido");
         return;
      }

      // Actualizamos el plan de trabajo.
      if (mode === "edit" && selectedPlan) {
         saveMutation.mutate({
            mode,
            planId: selectedPlan.id,
            payload: {
               name: result.data.name,
               description: result.data.description,
               isActive: result.data.isActive,
               goal: result.data.goal,
               level: result.data.level,
               durationWeeks: result.data.durationWeeks,
            },
         });

         return;
      }

      // Creamos el plan de trabajo.
      saveMutation.mutate({
         mode: mode === "duplicate" ? "duplicate" : "create",
         payload: {
            userId: result.data.userId || null,
            name: result.data.name,
            description: result.data.description,
            isActive: result.data.isActive,
            goal: result.data.goal,
            level: result.data.level,
            durationWeeks: result.data.durationWeeks,
         },
      });
   };

   return {
      isOpen,
      isSaving: saveMutation.isPending,
      mode,
      values,
      handleOpenChange,
      handleSubmit,
      handleValueChange,
      openCreate,
      openDuplicate,
      openEdit,
      setValues,
   };
}

// Convierte un plan existente en los valores del formulario.
function getFormValuesFromPlan(plan: WorkoutPlanViewModel): WorkoutPlanFormValues {
   return {
      name: plan.name,
      description: plan.description ?? "",
      userId: plan.userId ?? "",
      goal: plan.goal ?? "",
      level: plan.level ?? "",
      durationWeeks: plan.durationWeeks ? String(plan.durationWeeks) : "",
      isActive: plan.isActive ? "true" : "false",
   };
}
