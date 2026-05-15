import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signUp } from '@/features/auth/api/session-api';
import {
   registerSchema,
   type RegisterFormValues,
   type RegisterSubmitValues,
} from '@/features/auth/schemas/register.schema';

const DEFAULT_VALUES: RegisterFormValues = {
   name: '',
   email: '',
   password: '',
   confirmPassword: '',
   birthDate: '',
   weightKg: '',
   heightCm: '',
   acceptedTerms: false,
};

function splitFullName(name: string) {
   const parts = name.trim().split(/\s+/);
   const firstName = parts.shift() ?? name.trim();
   const lastName = parts.length > 0 ? parts.join(' ') : undefined;

   return { firstName, lastName };
}

export default function useRegisterView() {
   const form = useForm<RegisterFormValues, undefined, RegisterSubmitValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });

   const handleRegister = form.handleSubmit(async (values) => {
      const { firstName, lastName } = splitFullName(values.name);

      try {
         await signUp({
            email: values.email,
            password: values.password,
            firstName,
            lastName,
            birthDate: new Date(`${values.birthDate}T00:00:00.000Z`).toISOString(),
            weightKg: values.weightKg,
            heightCm: values.heightCm,
         });

         form.reset(DEFAULT_VALUES);
         router.replace('/(protected)/(tabs)');
      } catch (error) {
         const message =
            error instanceof Error ? error.message : 'No se pudo crear la cuenta';

         Alert.alert('Error de registro', message);
      }
   });

   return {
      control: form.control,
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting,
      handleRegister,
   };
}
