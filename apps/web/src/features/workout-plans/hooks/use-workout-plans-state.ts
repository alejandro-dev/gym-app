"use client";

import type { WorkoutPlan } from "@gym-app/types";
import {
   type WorkoutPlanExerciseDraft,
   type WorkoutPlanViewModel,
} from "../components/types";
import { useEffect, useState } from "react";

// Crea una fila vacia para que el editor siempre tenga un ejercicio inicial.
// No apunta a ningún Exercise todavía: el coach lo elegirá desde el selector.
export function buildFallbackExercises(planId: string): WorkoutPlanExerciseDraft[] {
   return [
      {
         id: `${planId}-exercise-1`,
         workoutPlanId: planId,
         isDraft: true,
         day: 1,
         order: 1,
         exerciseId: null,
         exercise: null,
         targetSets: null,
         targetRepsMin: null,
         targetRepsMax: null,
         targetWeightKg: null,
         restSeconds: null,
         notes: "",
      },
   ];
}

// Adapta el modelo que llega de la API al formato que necesita la UI.
// En particular, conserva exercises si el endpoint de detalle/listado los trae.
export function toWorkoutPlanViewModel(plan: WorkoutPlan): WorkoutPlanViewModel {
   return {
      ...plan,
      goal: plan.goal ? plan.goal : null,
      level: plan.level ? plan.level : null,
      durationWeeks: plan.durationWeeks ?? null,
      exercisesCount: plan.exercises?.length ?? 0,
      exercises: plan.exercises ?? [],
   };
}


export function useWorkoutPlansState(data: WorkoutPlan[]) {
   // Guardamos una copia local para que la tabla pueda actualizar planes sin esperar a otra peticion.
   const [plans, setPlans] = useState<WorkoutPlanViewModel[]>(() =>
      data.map(toWorkoutPlanViewModel),
   );

   // Si cambian los datos externos, resincronizamos el estado local con la nueva respuesta.
   useEffect(() => {
      setPlans(data.map(toWorkoutPlanViewModel));
   }, [data]);

   // Contadores derivados que se usan para mostrar resumenes/metricas en la vista.
   const activePlans = plans.filter((plan) => plan.isActive).length;
   const assignedPlans = plans.filter(
      (plan) => Boolean(plan.userId),
   ).length;
   const templatePlans = plans.filter(
      (plan) => !plan.userId,
   ).length;

   return {
      plans,
      setPlans,
      activePlans,
      assignedPlans,
      templatePlans,
   };
}
