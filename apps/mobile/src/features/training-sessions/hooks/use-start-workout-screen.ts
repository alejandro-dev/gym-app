import { useCallback, useEffect, useRef, useState } from "react";
import type { NavigationAction } from '@react-navigation/native';
import { useDeleteSessionMutation } from "../mutations/session/use-delete-session-mutation";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useWorkoutPlanQuery } from "../queries/workout-plan/use-workout-plan-query";
import { useWorkoutPlanExercisesQuery } from "../queries/workout-plan/use-workout-plan-exercises-query";
import { useProfileQuery } from "@/features/profile/queries/use-profile-query";
import { createWorkoutSession } from "@/services/api/workoutSessionService";
import { WorkoutSession } from "@gym-app/types";
import { ApiError } from "@/services/api/client";
import { Alert } from "react-native";
import { useCompleteSessionMutation } from "../mutations/session/use-complete-session-mutation";

export function useStartWorkoutScreen() {
   // Contexto para la vista de nueva rutina.
   const navigation = useNavigation();
   const pendingBackActionRef = useRef<NavigationAction | null>(null);
   const allowBackRef = useRef(false);
   const router = useRouter();

   // Hay una creación de sesión en curso.
   const isCreatingSessionRef = useRef(false);

   // Estado para mostrar el cuadro de diálogo de eliminación.
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
   const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);

   // Estados para mostrar el cronómetro.
   const [elapsedSeconds, setElapsedSeconds] = useState(0);
   const [isStopwatchPaused, setIsStopwatchPaused] = useState(false);
   // Guarda el momento exacto en el que pausamos el cronómetro.
   const pausedStartedAtMsRef = useRef<number | null>(null);

   // Acumula todo el tiempo que el cronómetro ha estado pausado.
   const totalPausedMsRef = useRef(0);


   // Mutaciones para crear y completar sesiones de entrenamiento.
   const deleteSessionMutation = useDeleteSessionMutation();
   const completeSessionMutation = useCompleteSessionMutation();

   // Obtenemos el id de la rutina.
   const params = useLocalSearchParams<{ id?: string }>();
   const workoutPlanId = typeof params.id === 'string' ? params.id : '';

   // Obtenemos la rutina.
   const workoutPlanQuery = useWorkoutPlanQuery(workoutPlanId);
   const exercisesQuery = useWorkoutPlanExercisesQuery(workoutPlanId);
   const exercises = exercisesQuery.data ?? [];

   // Obtenemos el perfil del usuario.
   const profileQuery = useProfileQuery();

   // Comprobar si hay alguna serie completada.
   const [completedSetsCount, setCompletedSetsCount] = useState(0);
   const incrementCompletedSets = () => {
      // Incrementamos el contador de series completadas.
      setCompletedSetsCount((current) => current + 1);
   };
   const decrementCompletedSets = () => {
      // Decrementamos el contador de series completadas.
      setCompletedSetsCount((current) => Math.max(current - 1, 0));
   };

   // Si se ha pulsado el botón de atras, mostramos el cuadro de diálogo de eliminación.
   useEffect(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (event) => {
         if (allowBackRef.current) return;
         if (!workoutSession) return;

         event.preventDefault();
         pendingBackActionRef.current = event.data.action;
         setIsDeleteDialogOpen(true);
      });

      return unsubscribe;
   }, [navigation, workoutSession]);

   useEffect(() => {
      // Crear sesión
      const createSession = async () => {
         if (workoutSession) return;
         if (isCreatingSessionRef.current) return;
         if (!workoutPlanQuery.data) return;
         if (!profileQuery.data) return;
         if (!workoutPlanId) return;

         // Hay una creación de sesión en curso.
         isCreatingSessionRef.current = true;

         try {
            // Creamos la sesión de entrenamiento.
            const session = await createWorkoutSession({
               userId: profileQuery.data.id,
               workoutPlanId,
               name: workoutPlanQuery.data.name,
               startedAt: new Date().toISOString(),
               notes: null,
               endedAt: null,
            });

            // Añadimos la sesión a la lista de sesiones.
            setWorkoutSession(session);
         } catch (error) {
            const message =
               error instanceof ApiError
                  ? error.message
                  : 'No se pudo crear la sesión. Inténtalo de nuevo.';

            Alert.alert('Error', message);
         } finally {
            // Deshabilitamos la creación de sesión.
            isCreatingSessionRef.current = false;
         }
      };

      // Llamamos a la función de creación de sesión.
      void createSession();
   }, [workoutSession, workoutPlanId, workoutPlanQuery.data, profileQuery.data]);

   // Calcula cuántos segundos reales lleva el entreno activo.
   const getCurrentElapsedSeconds = useCallback(() => {
      // Si todavía no tenemos sesión o fecha de inicio, devolvemos 0.
      if (!workoutSession?.startedAt) return 0;

      // Convertimos la fecha de inicio del entreno a milisegundos.
      const startedAtMs = new Date(workoutSession.startedAt).getTime();

      // Restamos el tiempo pausado para que no cuente como duración del entreno.
      return Math.max(
         0,
         Math.floor((Date.now() - startedAtMs - totalPausedMsRef.current) / 1000),
      );
   }, [workoutSession?.startedAt]);

   // Efecto para actualizar el cronómetro.
   useEffect(() => {
      // Si todavía no tenemos sesión o fecha de inicio o el cronómetro está pausado, no hacemos nada.
      if (!workoutSession?.startedAt) return;
      if (isStopwatchPaused) return;

      // Actualizamos el contador de tiempo.
      const updateElapsedSeconds = () => {
         setElapsedSeconds(getCurrentElapsedSeconds());
      };

      // Iniciamos el contador de tiempo.
      updateElapsedSeconds();

      // Luego la ejecutamos cada segundo.
      const intervalId = setInterval(updateElapsedSeconds, 1000);

      return () => clearInterval(intervalId);
   }, [workoutSession?.startedAt, isStopwatchPaused, getCurrentElapsedSeconds]);


   // Este efecto se ejecuta cuando volvemos a la pantalla de terminar la sesión.
   useFocusEffect(
      useCallback(() => {
         // Si pausedStartedAtMsRef tiene un valor, significa que venimos de una pausa.
         if (pausedStartedAtMsRef.current !== null) {
            // Calculamos cuánto tiempo hemos estado fuera/pausados:
            // Ese tiempo lo sumamos al total pausado.
            totalPausedMsRef.current += Date.now() - pausedStartedAtMsRef.current;
            // Y limpiamos el valor de pausedStartedAtMsRef.
            pausedStartedAtMsRef.current = null;
         }

         // Reactivamos el cronómetro.
         setIsStopwatchPaused(false);
      }, []),
   );

   // Eliminar sesión
   const handleConfirmDeleteWorkoutSession = async () => {
      if (!workoutSession) return;

      try {
         await deleteSessionMutation.mutateAsync(workoutSession.id);

         allowBackRef.current = true;
         setIsDeleteDialogOpen(false);

         if (pendingBackActionRef.current) {
            navigation.dispatch(pendingBackActionRef.current);
            pendingBackActionRef.current = null;
         } else {
            router.back();
         }

      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo eliminar la sesión. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   }; 

   // Evento que lleva al detalle de la rutina para que se pueda terminar.
   const handleGoDetailFinishScreen = async () => {
      if (!workoutSession) return;

      // Si no hay ninguna serie completada, mostramos un mensaje de error.
      if (completedSetsCount === 0) {
         Alert.alert('Entreno sin series', 'Completa al menos una serie antes de terminar el entreno.');
         return;
      }

      // Calculamos el tiempo exacto actual del entreno justo al pulsar "Terminar".
      const currentElapsedSeconds = getCurrentElapsedSeconds();

      // Guardamos ese valor en el estado para que la pantalla activa quede congelada.
      setElapsedSeconds(currentElapsedSeconds);

      // Pausamos el cronómetro.
      setIsStopwatchPaused(true);

      // Guardamos el momento exacto en el que pausamos el cronómetro.s
      pausedStartedAtMsRef.current = Date.now();

      // Ir a la pantalla de terminar la sesión.
      router.push({
         pathname: '/(protected)/workout-sessions/[id]/finish',
         params: {
            id: workoutSession.id,
            durationSeconds: String(currentElapsedSeconds),
            completedSetsCount: String(completedSetsCount),
         },
      });
   };

   return {
      workoutPlanQuery,
      exercisesQuery,
      exercises,
      profileQuery,
      workoutSession,
      isDeleteDialogOpen,
      isDeletingWorkoutSession: deleteSessionMutation.isPending,
      isFinishingWorkoutSession: completeSessionMutation.isPending,
      completedSetsCount,
      elapsedSeconds,
      setIsDeleteDialogOpen,
      handleConfirmDeleteWorkoutSession,
      handleGoDetailFinishScreen,
      incrementCompletedSets,
      decrementCompletedSets,
   }
}
