import z from "zod";
import {
  EXERCISE_CATEGORY_VALUES,
  MUSCLE_GROUP_VALUES,
} from "@gym-app/types";

const optionalTextField = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}, z.string().min(1).nullable());

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Nombre es obligatorio"),
  slug: z.string().trim().min(1, "Slug es obligatorio"),
  description: optionalTextField,
  instructions: optionalTextField,
  muscleGroup: z.enum(MUSCLE_GROUP_VALUES),
  category: z.enum(EXERCISE_CATEGORY_VALUES),
  equipment: optionalTextField,
  isCompound: z.boolean(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
