import { useState } from "react";
import { getStatusErrorMessage, StatusMessageMap } from "../lib/auth-errors";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema } from "../schemas/forgot-password.schema";
import { forgotPassword } from "@/services/authService";

const FORGOT_PASSWORD_ERROR_MESSAGES: StatusMessageMap = {
   400: "Ingresa una dirección de correo válida.",
   429: "Demasiados intentos de restablecimiento. Por favor, espera unos minutos e inténtalo de nuevo.",
   503: "El servicio de restablecimiento de contraseña está temporalmente no disponible.",
};

export function useForgotPassword() {
   // Formulario de restablecimiento de contraseña
   const [email, setEmail] = useState("");
   const [validationError, setValidationError] = useState<string | null>(null);

   // Mutación para enviar el correo de restablecimiento de contraseña
   const mutation = useMutation({
      mutationFn: forgotPassword,
   });

   // Evento de envío del formulario y validación
   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      // Validamos que el email sea válido
      const result = forgotPasswordSchema.safeParse({ email });

      // Si no es válido, lanzamos un error
      if (!result.success) {
         setValidationError(result.error.issues[0]?.message ?? "Enter a valid email.");
         return;
      }

      // Si es válido, enviamos el correo de restablecimiento de contraseña
      setValidationError(null);
      mutation.mutate({ email: result.data.email });
   }

   // Mensaje de error
   const errorMessage = mutation.isError
      ? getStatusErrorMessage(
           mutation.error,
           FORGOT_PASSWORD_ERROR_MESSAGES,
           "We couldn't request a password reset. Please try again.",
        )
      : null;

   return {
      email,
      setEmail,
      validationError,
      errorMessage,
      mutation,
      handleSubmit,
   };
}