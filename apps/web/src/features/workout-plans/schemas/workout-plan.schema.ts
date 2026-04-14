import z from "zod";
import { WORKOUT_PLAN_GOALS, WORKOUT_PLAN_LEVELS } from "../components/types";

// Preprocesador de campos opcionales para campos de texto.
const optionalTextField = z.preprocess((value) => {
   if (typeof value !== "string") {
      return value;
   }

   const trimmedValue = value.trim();
   return trimmedValue === "" ? null : trimmedValue;
}, z.string().min(1).nullable());

// Definición del esquema de validación de un plan de trabajo.
export const workoutPlanSchema = z.object({
   // userId: z.string().trim().min(1, "Selecciona un atleta").nullable(),
   userId: z.preprocess(
      (value) => value === "" ? undefined : value,
      z.string().trim().min(1, "Selecciona un atleta").optional()
   ),
   name: z.string().trim().min(1, "Nombre es obligatorio"),
   description: optionalTextField,
   isActive: z.boolean(),
   goal: z.enum(WORKOUT_PLAN_GOALS).nullable(),
   level: z.enum(WORKOUT_PLAN_LEVELS).nullable(),
   durationWeeks: z.number().int().min(1, "Duración debe ser mayor que 0").nullable(),
});

export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
