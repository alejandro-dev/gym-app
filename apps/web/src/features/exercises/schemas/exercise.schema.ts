import z from "zod";

export const exerciseSchema = z.object({
   name: z.string().trim().min(1, "Nombre es obligatorio"),
   slug: z.string().trim().min(1, "Slug es obligatorio"),
   description: z.string().trim().min(1, "Descripción es obligatorio").optional(),
   instructions: z.string().trim().min(1, "Instrucciones es obligatorio").optional(),
   muscleGroup: z.enum(["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE", "FULL_BODY", "GLUTES", "CALVES", "CARDIO"]),
   category: z.enum(["STRENGTH", "BODYWEIGHT", "CARDIO"]),
   equipment: z.string().trim().min(1, "Equipamiento es obligatorio").optional(),
   isCompound: z.boolean(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;