import { Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { useUpdateProfileMutation } from "../mutations/use-update-profile-mutation";
import { useProfileQuery } from "../queries/use-profile-query";
import {
   personalDataSchema,
   type PersonalDataFormValues,
   type PersonalDataSubmitValues,
} from "../schemas/personal-data.schema";

export function usePersonalDataForm() {
   // Query para obtener los datos del perfil actual
   const profileQuery = useProfileQuery();

   // Mutación para actualizar el perfil del usuario
   const updateProfileMutation = useUpdateProfileMutation();

   // Formulario para actualizar los datos del perfil del usuario
   const form = useForm<PersonalDataFormValues, undefined, PersonalDataSubmitValues>({
      resolver: zodResolver(personalDataSchema),
      defaultValues: {
         firstName: '',
         lastName: '',
         weightKg: '',
         heightCm: '',
         birthDate: '',
      },
   });

   useEffect(() => {
      // Si no hay datos de perfil, no hace nada
      if (!profileQuery.data) return;

      // Restablece los valores del formulario a los valores del perfil actual
      form.reset({
         firstName: profileQuery.data.firstName ?? '',
         lastName: profileQuery.data.lastName ?? '',
         weightKg: profileQuery.data.weightKg?.toString() ?? '',
         heightCm: profileQuery.data.heightCm?.toString() ?? '',
         birthDate: profileQuery.data.birthDate?.slice(0, 10) ?? '',
      });
   }, [form, profileQuery.data]);

   // Función que actualiza el perfil del usuario
   const handleSave = form.handleSubmit(async (values) => {
      try {
         await updateProfileMutation.mutateAsync({
            firstName: values.firstName || null,
            lastName: values.lastName || null,
            weightKg: values.weightKg ?? null,
            heightCm: values.heightCm ?? null,
            birthDate: values.birthDate
               ? new Date(`${values.birthDate}T00:00:00.000Z`).toISOString()
               : null,
         });

         Alert.alert('Datos guardados', 'Tu perfil se ha actualizado correctamente.');
      } catch (error) {
         const message =
            error instanceof Error ? error.message : 'No se pudo actualizar el perfil';

         Alert.alert('Error', message);
      }
   });

   return {
      control: form.control,
      errors: form.formState.errors,
      isLoading: profileQuery.isLoading,
      isSaving: updateProfileMutation.isPending,
      handleSave,
   };
}
