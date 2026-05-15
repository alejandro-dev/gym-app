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
   email: 'usuario4@gym.local',
   password: 'Demo1234!',
   confirmPassword: 'Demo1234!',
   username: 'usuario4_gym',
   firstName: 'Carla',
   lastName: 'Atleta',
   weightKg: '',
   heightCm: '',
   birthDate: '1995-06-30',
   acceptedTerms: false,
};

export default function useRegisterView() {
   const form = useForm<RegisterFormValues, undefined, RegisterSubmitValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });

   const handleRegister = form.handleSubmit(async (values) => {
      try {
         await signUp({
            email: values.email,
            password: values.password,
            username: values.username,
            firstName: values.firstName,
            lastName: values.lastName,
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
