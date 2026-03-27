import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/features/auth/schemas/register.schema";
import { register } from "@/services/authService";
import { getStatusErrorMessage, type StatusMessageMap } from "@/features/auth/lib/auth-errors";

const EMPTY_CREDENTIALS: RegisterInput = {
   email: "",
   password: "",
   confirmPassword: "",
   username: "",
   firstName: "",
   lastName: "",
   weightKg: undefined,
   heightCm: undefined,
   birthDate: "",
};

const REGISTER_ERROR_MESSAGES: StatusMessageMap = {
   400: "Enter a valid email",
   409: "An account with this email already exists",
   422: "The password does not meet the minimum requirements"
};

export function useAuthRegister() {
   const router = useRouter();
   const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);

   // Leer datos del formulario y validar
   const readData = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCredentials((current) => ({
         ...current,
         [name]: name === "weightKg" || name === "heightCm"
            ? value === ""
               ? undefined
               : Number(value)
            : value,
      }));
   };

   // Realizamos la petición al service
   const mutation = useMutation({
      mutationFn: register,
      onSuccess: () => {
         toast.success("Account created successfully");
         setCredentials(EMPTY_CREDENTIALS);
         router.push("/login");
      },
      onError: (error) => {
         toast.error(getStatusErrorMessage(error, REGISTER_ERROR_MESSAGES));
      },
   });

   // Evento de envío del formulario y validación
   const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validamos el formulario
      const result = registerSchema.safeParse({
         email: credentials.email.trim(),
         username: credentials.username?.trim() || undefined,
         password: credentials.password,
         confirmPassword: credentials.confirmPassword,
         firstName: credentials.firstName?.trim() || undefined,
         lastName: credentials.lastName?.trim() || undefined,
         weightKg: credentials.weightKg,
         heightCm: credentials.heightCm,
         birthDate: credentials.birthDate || undefined,
      });

      // Si el formulario no es válido, lanzamos una excepción
      if (!result.success) {
         toast.warning(result.error.issues[0]?.message ?? "Invalid form");
         return;
      }

      // Extraemos los datos del formulario
      const { confirmPassword, ...payload } = result.data;
      void confirmPassword;

      // Realizamos la petición
      await mutation.mutateAsync(payload);
   };

   return {
      credentials,
      readData,
      handleSubmit,
      isLoading: mutation.isPending,
   };
}
