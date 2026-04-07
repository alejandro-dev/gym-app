import z from "zod";

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
  muscleGroup: z.enum([
    "CHEST",
    "BACK",
    "LEGS",
    "SHOULDERS",
    "ARMS",
    "CORE",
    "FULL_BODY",
    "GLUTES",
    "CALVES",
    "CARDIO",
  ]),
  category: z.enum(["STRENGTH", "BODYWEIGHT", "CARDIO"]),
  equipment: optionalTextField,
  isCompound: z.boolean(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
