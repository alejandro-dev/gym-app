import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
   forgotPasswordSchema,
   type ForgotPasswordFormValues,
   type ForgotPasswordSubmitValues,
} from '../schemas/forgot-password.schema';
import { forgotPassword } from '@/services/api/authService';

const DEFAULT_VALUES: ForgotPasswordFormValues = {
   email: '',
};

export default function useForgotPasswordView() {
   // Formulario de restablecimiento de contraseña
   const form = useForm<ForgotPasswordFormValues, undefined, ForgotPasswordSubmitValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });

   // Evento de envío del formulario y validación
   const handleForgotPassword = form.handleSubmit(async (values) => {
      await forgotPassword({ email: values.email });

      Alert.alert(
         'Revisa tu email',
         `Si existe una cuenta para ${values.email}, recibiras instrucciones para restablecer tu contrasena.`,
      );
      form.reset(DEFAULT_VALUES);
   });

   return {
      control: form.control,
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting,
      handleForgotPassword,
   };
}
