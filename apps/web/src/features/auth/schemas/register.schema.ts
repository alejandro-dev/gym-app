import { z } from "zod";

export const registerSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
         message: "Enter a valid email",
      }),
   username: z.string().trim().min(3).max(30).optional(),
   password: z.string().min(8, "Password must have at least 8 characters"),
   confirmPassword: z.string().min(8, "Confirm your password"),
   firstName: z.string().trim().min(1, "First name is required").optional(),
   lastName: z.string().trim().min(1, "Last name is required").optional(),
   weightKg: z.coerce.number().positive().max(500).optional(),
   heightCm: z.coerce.number().positive().max(300).optional(),
   birthDate: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
   path: ["confirmPassword"],
   message: "Passwords do not match",
});


export type RegisterInput = z.infer<typeof registerSchema>;
