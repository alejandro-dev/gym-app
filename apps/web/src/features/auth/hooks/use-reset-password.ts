import { useState } from "react";
import { getStatusErrorMessage, StatusMessageMap } from "../lib/auth-errors";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/authService";
import { resetPasswordSchema } from "../schemas/reset-password.schema";

const RESET_PASSWORD_ERROR_MESSAGES: StatusMessageMap = {
   400: "Ingresa una contraseña válida.",
   401: "Este enlace de restablecimiento de contraseña no es válido o ha expirado.",
   429: "Demasiados intentos de restablecimiento. Por favor, espera unos minutos e inténtalo de nuevo.",
   503: "El servicio de restablecimiento de contraseña está temporalmente no disponible.",
};

export function useResetPassword(token?: string) {
   // Formulario de restablecimiento de contraseña
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [validationError, setValidationError] = useState<string | null>(null);

   // Mutación para restablecer la contraseña
   const mutation = useMutation({
      mutationFn: resetPassword,
   });

   // Evento de envío del formulario y validación
   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!token) {
         setValidationError("This reset link does not include a token.");
         return;
      }

      const result = resetPasswordSchema.safeParse({
         newPassword,
         confirmPassword,
      });

      if (!result.success) {
         setValidationError(result.error.issues[0]?.message ?? "Enter a valid password.");
         return;
      }

      setValidationError(null);
      mutation.mutate({
         token,
         newPassword: result.data.newPassword,
      });
   }

   // Mensaje de error
   const errorMessage = mutation.isError
      ? getStatusErrorMessage(
           mutation.error,
           RESET_PASSWORD_ERROR_MESSAGES,
           "We couldn't reset your password. Please request a new link and try again.",
        )
      : null;

   return {
      newPassword,
      confirmPassword,
      showPassword,
      setNewPassword,
      setConfirmPassword,
      setShowPassword,
      validationError,
      errorMessage,
      mutation,
      handleSubmit,
   };
}