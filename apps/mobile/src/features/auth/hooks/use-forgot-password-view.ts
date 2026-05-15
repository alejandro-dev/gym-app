import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { forgotPassword } from '@/features/auth/api/auth-api';
import {
   forgotPasswordSchema,
   type ForgotPasswordFormValues,
   type ForgotPasswordSubmitValues,
} from '@/features/auth/schemas/forgot-password.schema';

const DEFAULT_VALUES: ForgotPasswordFormValues = {
   email: '',
};

export default function useForgotPasswordView() {
   const form = useForm<ForgotPasswordFormValues, undefined, ForgotPasswordSubmitValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });

   const handleForgotPassword = form.handleSubmit(async (values) => {
      try {
         await forgotPassword({ email: values.email });

         Alert.alert(
            'Revisa tu email',
            `Si existe una cuenta para ${values.email}, recibiras instrucciones para restablecer tu contrasena.`,
         );
         form.reset(DEFAULT_VALUES);
      } catch (error) {
         const message =
            error instanceof Error
               ? error.message
               : 'No se pudo procesar la solicitud de recuperacion';

         Alert.alert('No se pudo enviar el enlace', message);
      }
   });

   return {
      control: form.control,
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting,
      handleForgotPassword,
   };
}
