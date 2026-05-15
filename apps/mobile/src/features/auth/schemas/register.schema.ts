import { z } from 'zod';

const emailSchema = z
   .string()
   .trim()
   .min(1, 'El email es obligatorio')
   .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: 'Añade un correo electrónico válido',
   });

export const registerSchema = z
   .object({
      firstName: z
         .string()
         .trim()
         .min(1, 'El nombre es obligatorio')
         .min(2, 'Minimo 2 caracteres'),
      lastName: z
         .string()
         .trim()
         .min(1, 'Los apellidos son obligatorios')
         .min(2, 'Minimo 2 caracteres'),
      username: z
         .string()
         .trim()
         .min(3, 'Minimo 3 caracteres')
         .max(30, 'Maximo 30 caracteres')
         .regex(/^[a-zA-Z0-9._-]+$/, 'Usa solo letras, numeros, puntos, guiones y guion bajo'),
      email: emailSchema,
      password: z.string().min(8, 'Minimo 8 caracteres'),
      confirmPassword: z.string().min(8, 'Confirma tu contrasena'),
      birthDate: z
         .string()
         .trim()
         .min(1, 'La fecha es obligatoria')
         .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD'),
      weightKg: z
         .string()
         .trim()
         .optional()
         .transform((value) => value === '' ? undefined : value)
         .pipe(
            z.string()
               .refine((value) => !Number.isNaN(Number(value)), 'Introduce un peso valido')
               .transform((value) => Number(value))
               .refine((value) => value > 0, 'El peso debe ser mayor que 0')
               .refine((value) => value <= 500, 'Introduce un peso valido')
               .optional(),
         ),
      heightCm: z
         .string()
         .trim()
         .optional()
         .transform((value) => value === '' ? undefined : value)
         .pipe(
            z.string()
               .refine((value) => !Number.isNaN(Number(value)), 'Introduce una altura valida')
               .transform((value) => Number(value))
               .refine((value) => value > 0, 'La altura debe ser mayor que 0')
               .refine((value) => value <= 300, 'Introduce una altura valida')
               .optional(),
         ),
      acceptedTerms: z
         .boolean()
         .refine((value) => value, 'Acepta los terminos para continuar'),
   })
   .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Las contrasenas no coinciden',
   });

export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterSubmitValues = z.output<typeof registerSchema>;
