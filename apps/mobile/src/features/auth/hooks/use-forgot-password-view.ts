import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
