import { workoutSessionQueryKeys } from "@/features/training-sessions/queries/workout-sessions/workout-session-query-keys";
import { deleteWorkoutSession } from "@/services/api/workoutSessionService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook para eliminar una sesión.
export function useDeleteSessionMutation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (workoutSessionId: string) => deleteWorkoutSession(workoutSessionId),
      onSuccess: async () => {
         // Invalidamos la lista de sesiones de entrenamiento para actualizar los datos.
         await queryClient.invalidateQueries({
            queryKey: workoutSessionQueryKeys.lists(),
         });
      },
   });
}
