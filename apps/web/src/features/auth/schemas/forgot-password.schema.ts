import { z } from "zod";

export const forgotPasswordSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
         message: "Enter a valid email",
      }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
