import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { login } from '@/services/api/authService';
import { setAccessToken } from '@/services/storage/secure-storage';
import {
   loginSchema,
   type LoginFormValues,
   type LoginSubmitValues,
} from '@/features/auth/schemas/login.schema';

// Valores por defecto para el formulario de inicio de sesión
const DEFAULT_VALUES: LoginFormValues = {
   email: '',
   password: '',
};

export default function useLoginView() {
   // Formulario de inicio de sesión
   const form = useForm<LoginFormValues, undefined, LoginSubmitValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });

   // Evento de envío del formulario y validación
   const handleLogin = form.handleSubmit(async (values) => {
      try {
         const response = await login({
            email: values.email,
            password: values.password,
         });

         await setAccessToken(response.accessToken);

         form.reset(DEFAULT_VALUES);
         router.replace('/(protected)');
      } catch (error) {
         const message =
            error instanceof Error ? error.message : 'No se pudo iniciar sesion';

         Alert.alert('Error de acceso', message);
      }
   });

   return {
      control: form.control,
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting,
      handleLogin,
   };
}
