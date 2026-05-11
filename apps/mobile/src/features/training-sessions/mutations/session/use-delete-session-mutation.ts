import { useMutation } from '@tanstack/react-query';
import { deleteWorkoutSession } from '@/services/api/workoutSessionService';

// Hook para eliminar una rutina.
export function useDeleteSessionMutation() {
   return useMutation({
      mutationFn: (workoutSessionId: string) => deleteWorkoutSession(workoutSessionId),
   });
}
