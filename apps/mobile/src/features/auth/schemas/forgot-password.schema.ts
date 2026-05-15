import { z } from 'zod';

export const forgotPasswordSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
         message: 'Añade un correo electrónico válido',
      }),
});

export type ForgotPasswordFormValues = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordSubmitValues = z.output<typeof forgotPasswordSchema>;
