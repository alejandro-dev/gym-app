import { createWorkoutSession, CreateWorkoutSessionPayload } from "@/services/api/workoutSessionService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook para crear una nueva rutina.
export function useCreateSessionMutation() {   
   return useMutation({
      mutationFn: (payload: CreateWorkoutSessionPayload) => createWorkoutSession(payload),
   });
}
