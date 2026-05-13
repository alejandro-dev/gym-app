import { completeWorkoutSession } from "@/services/api/workoutSessionService";
import { useMutation } from "@tanstack/react-query";

type CompleteSessionVariables = {
   workoutSessionId: string;
   notes?: string | null;
};

// Hook para completar una sesión de entrenamiento.
export function useCompleteSessionMutation() {
   return useMutation({
      mutationFn: ({ workoutSessionId, notes = null }: CompleteSessionVariables) =>
         completeWorkoutSession(workoutSessionId, notes),
  });
}