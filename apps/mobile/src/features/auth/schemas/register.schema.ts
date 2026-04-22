import { z } from 'zod';

export const registerSchema = z
   .object({
      email: z
            .string()
            .trim()
            .min(1, "El email es obligatorio")
            .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
               message: "Añade un correo electrónico válido",
            }),
      password: z.string().min(8, 'Minimo 8 caracteres'),
      confirmPassword: z.string().min(8, 'Confirma tu contrasena'),
      username: z.string().trim().min(3, 'Minimo 3 caracteres').max(30, 'Maximo 30 caracteres').optional(),
      firstName: z.string().trim().min(1, 'El nombre es obligatorio').optional(),
      lastName: z.string().trim().min(1, 'Los apellidos son obligatorios').optional(),
      weightKg: z
         .string()
         .trim()
         .min(1, 'El peso es obligatorio')
         .refine((value) => !Number.isNaN(Number(value)), 'Introduce un peso valido')
         .transform((value) => Number(value))
         .refine((value) => value > 0, 'El peso debe ser mayor que 0')
         .optional(),
      heightCm: z
         .string()
         .trim()
         .min(1, 'La altura es obligatoria')
         .refine((value) => !Number.isNaN(Number(value)), 'Introduce una altura valida')
         .transform((value) => Number(value))
         .refine((value) => value > 0, 'La altura debe ser mayor que 0')
         .optional(),
      birthDate: z
         .string()
         .trim()
         .min(1, 'La fecha es obligatoria')
         .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD').optional(),
   })
   .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Las contrasenas no coinciden',
   });

export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterSubmitValues = z.output<typeof registerSchema>;
