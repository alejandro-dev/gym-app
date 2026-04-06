import { z } from "zod";

export const userSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
         message: "Enter a valid email",
      }),
   username: z.string().trim().min(3, "Username must have at least 3 characters").max(30).optional(),
   firstName: z.string().trim().min(1, "First name is required").optional(),
   lastName: z.string().trim().min(1, "Last name is required").optional(),
   role: z.enum(["USER", "ADMIN", "COACH"]),
});


export type UserInput = z.infer<typeof userSchema>;
