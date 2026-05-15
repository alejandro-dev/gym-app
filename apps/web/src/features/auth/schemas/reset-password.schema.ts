import { z } from "zod";

export const resetPasswordSchema = z
   .object({
      newPassword: z.string().min(8, "Password must have at least 8 characters"),
      confirmPassword: z.string().min(8, "Confirm your password"),
   })
   .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
   });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
