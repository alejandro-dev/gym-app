import { Alert } from 'react-native';
import { router } from 'expo-router';

import { ApiError } from '@/services/api/client';
import { useProfileQuery } from '@/features/profile/queries/use-profile-query';

import { useCreateRoutineMutation } from '../mutations/use-create-routine-mutation';
import { useNewRoutine } from '../context/new-routine-context';

export default function useNewRutineView() {
   const routine = useNewRoutine();
   const profileQuery = useProfileQuery();
   const createRoutineMutation = useCreateRoutineMutation();

   // Validamos si el usuario puede crear una rutina.
   const canSubmitRoutine =
      routine.name.trim().length > 0 &&
      routine.exercises.length > 0 &&
      Boolean(profileQuery.data?.id) &&
      !createRoutineMutation.isPending;

   // Evento para crear una nueva rutina.
   const handleCreateRoutine = async () => {
      // Nos aseguramos de que tenemos un perfil y que la rutina sea válida.
      const profile = profileQuery.data;

      if (!profile || !canSubmitRoutine) return;

      try {
         // Creamos la rutina.
         await createRoutineMutation.mutateAsync({
            plan: {
               userId: profile.id,
               name: routine.name.trim(),
               description: routine.description.trim() || null,
               goal: routine.selectedGoal,
               level: routine.selectedLevel,
               durationWeeks: toOptionalNumber(routine.durationWeeks),
               isActive: routine.status === 'active',
            },
            exercises: routine.exercises,
         });

         // Reseteamos los datos de la rutina.
         routine.resetRoutine();

         // Mostramos un mensaje de confirmación.
         Alert.alert(
            'Rutina creada',
            'Tu rutina se ha creado correctamente.',
         );

         router.replace('/training-sessions');
      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo crear la rutina. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   };

   return {
      ...routine,
      canSubmitRoutine,
      isCreatingRoutine: createRoutineMutation.isPending,
      handleCreateRoutine,
   };
}

// Función para convertir una cadena de texto en un número opcional.
function toOptionalNumber(value: string) {
   const normalizedValue = value.trim().replace(',', '.');

   if (!normalizedValue) {
      return null;
   }

   const parsedValue = Number(normalizedValue);

   return Number.isFinite(parsedValue) ? parsedValue : null;
}
