import { completeWorkoutSession } from "@/services/api/workoutSessionService";
import { useMutation } from "@tanstack/react-query";

// Hook para completar una sesión de entrenamiento.
export function useCompleteSessionMutation() {
   return useMutation({
      mutationFn: (workoutSessionId: string) => completeWorkoutSession(workoutSessionId),
   });
}