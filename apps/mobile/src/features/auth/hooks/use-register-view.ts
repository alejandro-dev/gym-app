import { useForm } from 'react-hook-form';
import { router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import {
   registerSchema,
   type RegisterFormValues,
   type RegisterSubmitValues,
} from '@/features/auth/schemas/register.schema';
import { register } from '@/services/api/authService';
import { Alert } from 'react-native';

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
};
export default function useRegisterView() {
   // Formulario de registro
   const form = useForm<RegisterFormValues, undefined, RegisterSubmitValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: DEFAULT_VALUES,
      mode: 'onSubmit',
   });


   // Evento de envío del formulario y validación
   const handleRegister = form.handleSubmit(async (values) => {
      // Extraemos los datos del formulario
      const payload = {
         email: values.email,
         password: values.password,
         username: values.username,
         firstName: values.firstName,
         lastName: values.lastName,
         weightKg: values.weightKg,
         heightCm: values.heightCm,
         birthDate: new Date(`${values.birthDate}T00:00:00.000Z`).toISOString(),
      };

      try {
         await register(payload);

         Alert.alert(
            'Cuenta creada',
            'Tu cuenta se ha creado correctamente. Ya puedes iniciar sesion.',
         );

         form.reset(DEFAULT_VALUES);
         router.replace('/login');
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