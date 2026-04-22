import { z } from "zod";

export const loginSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, "El email es obligatorio")
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
         message: "Añade un correo electrónico válido",
      }),
  	password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginSubmitValues = z.output<typeof loginSchema>;