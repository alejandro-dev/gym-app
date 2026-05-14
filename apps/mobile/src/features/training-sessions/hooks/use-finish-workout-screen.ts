import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useWorkoutSessionQuery } from "@/features/home/queries/use-workout-session-query";
import { useDeleteSessionMutation } from "../mutations/session/use-delete-session-mutation";
import { useCompleteSessionMutation } from "../mutations/session/use-complete-session-mutation";
import { ApiError } from "@/services/api/client";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { workoutSessionQueryKeys } from "../queries/workout-sessions/workout-session-query-keys";

export default function useFinishWorkoutScreen() {
   // Contexto para el cliente de consultas.
   const queryClient = useQueryClient();

   // Estado para mostrar el cuadro de diálogo de eliminación.
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
   const [notes, setNotes] = useState('');

   // Obtenemos el id de la rutina y el tiempo transcurrido desde la última vez que se actualizó el cronómetro antes de ir a la pantalla de terminar la sesión y el número de series completadas.
   const params = useLocalSearchParams<{
      id?: string;
      durationSeconds?: string;
      completedSetsCount?: string;
   }>();

   // Obtenemos el id de la rutina.
   const workoutSessionId = typeof params.id === 'string' ? params.id : '';

   // Obtenemos el tiempo transcurrido desde la última vez que se actualizó el cronómetro antes de ir a la pantalla de terminar la sesión.
   const durationSecondsParam = typeof params.durationSeconds === 'string' ? params.durationSeconds : '';
   const durationSeconds = Number.parseInt(durationSecondsParam, 10);
   const stoppedDurationSeconds = Number.isFinite(durationSeconds)
      ? Math.max(0, durationSeconds)
      : 0;

   // Obtenemos el número de series completadas.
   const completedSetsCountParam = typeof params.completedSetsCount === 'string' ? params.completedSetsCount : '';
   const parsedCompletedSetsCount = Number.parseInt(completedSetsCountParam, 10);
   const stoppedCompletedSetsCount = Number.isFinite(parsedCompletedSetsCount)
      ? Math.max(0, parsedCompletedSetsCount)
      : 0;


   // Obtenemos la rutina.
   const workoutSessionQuery = useWorkoutSessionQuery(workoutSessionId);
   const workoutSession = workoutSessionQuery.data ?? null;

   // Mutaciones para crear y completar sesiones de entrenamiento.
   const deleteSessionMutation = useDeleteSessionMutation();
   const completeSessionMutation = useCompleteSessionMutation();

   // Eliminar sesión
   const handleConfirmDeleteWorkoutSession = async () => {
      // Si no hay sesión de entrenamiento, no hacemos nada.
      if (!workoutSession) return;

      try {
         // Eliminamos la sesión de entrenamiento.
         await deleteSessionMutation.mutateAsync(workoutSession.id);

         // Invalidamos las consultas de rutinas.
         await queryClient.invalidateQueries({
            queryKey: workoutSessionQueryKeys.lists(),
         });

         // Cerramos el diálogo de eliminación.
         setIsDeleteDialogOpen(false);

         // Volvemos a la pantalla de rutinas.
         router.replace('/training-sessions');

      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo eliminar la sesión. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   }; 

   // Evento que termina la sesión
   const handleFinishWorkoutSession = async () => {
      // Si no hay sesión de entrenamiento, no hacemos nada.
      if (!workoutSession) return;

      try {
         // Completamos la sesión de entrenamiento.
         await completeSessionMutation.mutateAsync({
            workoutSessionId: workoutSession.id,
            notes: notes.trim() === '' ? null : notes.trim()
         });

         // Invalidamos las consultas de rutinas.
         await queryClient.invalidateQueries({
            queryKey: workoutSessionQueryKeys.lists(),
         });

         // Volvemos a la pantalla de rutinas.
         router.replace('/training-sessions');

      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo terminar el entreno. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   };

   return {
      workoutSession,
      isDeleteDialogOpen,
      isDeletingWorkoutSession: deleteSessionMutation.isPending,
      isFinishingWorkoutSession: completeSessionMutation.isPending,
      notes,
      durationSeconds: stoppedDurationSeconds,
      completedSetsCount: stoppedCompletedSetsCount,
      setIsDeleteDialogOpen,
      handleConfirmDeleteWorkoutSession,
      handleFinishWorkoutSession,
      setNotes
   }
}
