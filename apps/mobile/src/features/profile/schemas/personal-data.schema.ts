import z from "zod";

export const personalDataSchema = z.object({
   firstName: z
      .string()
      .trim()
      .optional()
      .transform((value) => value === '' ? undefined : value)
      .pipe(z.string().min(1, 'El nombre es obligatorio').optional()),
   lastName: z
      .string()
      .trim()
      .optional()
      .transform((value) => value === '' ? undefined : value)
      .pipe(z.string().min(1, 'Los apellidos son obligatorios').optional()),
   weightKg: z
      .string()
      .trim()
      .optional()
      .transform((value) => value === '' ? undefined : value)
      .pipe(
         z.string()
            .min(1, 'El peso es obligatorio')
            .refine((value) => !Number.isNaN(Number(value)), 'Introduce un peso valido')
            .transform((value) => Number(value))
            .refine((value) => value > 0, 'El peso debe ser mayor que 0')
            .optional(),
      ),
   heightCm: z
      .string()
      .trim()
      .optional()
      .transform((value) => value === '' ? undefined : value)
      .pipe(
         z.string()
            .min(1, 'La altura es obligatoria')
            .refine((value) => !Number.isNaN(Number(value)), 'Introduce una altura valida')
            .transform((value) => Number(value))
            .refine((value) => value > 0, 'La altura debe ser mayor que 0')
            .optional(),
      ),
   birthDate: z
      .string()
      .trim()
      .optional()
      .transform((value) => value === '' ? undefined : value)
      .pipe(
         z.string()
            .min(1, 'La fecha es obligatoria')
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD')
            .optional(),
      ),
});

export type PersonalDataFormValues = z.input<typeof personalDataSchema>;
export type PersonalDataSubmitValues = z.output<typeof personalDataSchema>;
