import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkoutPlan } from '@/services/api/workoutPlansService';
import { workoutPlanQueryKeys } from '../../queries/workout-plan/workout-plan-query-keys';

// Hook para eliminar una rutina.
export function useDeleteRoutineMutation() {
   const queryClient = useQueryClient();

   // Hook para eliminar una rutina.
   return useMutation({
      mutationFn: (workoutPlanId: string) => deleteWorkoutPlan(workoutPlanId),
      onSuccess: async () => {
         // Invalidamos la lista de rutinas para actualizar los datos.
         await queryClient.invalidateQueries({
            queryKey: workoutPlanQueryKeys.lists(),
         });
      },
   });
}
