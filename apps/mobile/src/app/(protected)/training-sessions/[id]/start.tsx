import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import DeleteWorkoutSessionDialog from '@/features/training-sessions/components/active-workout/delete-workout-session-dialog';
import ActiveWorkoutView from '@/features/training-sessions/views/active-workout-view';
import { useStartWorkoutScreen } from '@/features/training-sessions/hooks/use-start-workout-screen';
import { Stack } from 'expo-router';
import { Button } from 'react-native-paper';

// Maqueta de la pantalla de entrenamiento activo al empezar una rutina.
export default function ActiveWorkoutScreen() {
  
   const { 
      workoutPlanQuery,
      exercisesQuery,
      exercises,
      profileQuery,
      workoutSession,
      isDeleteDialogOpen,
      isDeletingWorkoutSession,
      isFinishingWorkoutSession,
      completedSetsCount,
      setIsDeleteDialogOpen,
      handleConfirmDeleteWorkoutSession,
      handleFinishWorkoutSession,
      incrementCompletedSets,
      decrementCompletedSets,
   } = useStartWorkoutScreen();
   
   return (
      <>
         <Stack.Screen
            options={{
               headerRight: () => (
                  <Button
                     mode="contained"
                     compact
                     loading={isFinishingWorkoutSession}
                     disabled={!workoutSession || isFinishingWorkoutSession}
                     onPress={handleFinishWorkoutSession}
                  >
                     Terminar
                  </Button>
               ),
            }}
         />

         <ProtectedScreen edges={['left', 'right']}>
            <ActiveWorkoutView 
               setIsDeleteDialogOpen={setIsDeleteDialogOpen} 
               handleFinishWorkoutSession={handleFinishWorkoutSession}
               workoutPlanQuery={workoutPlanQuery}
               exercisesQuery={exercisesQuery}
               exercises={exercises}
               profileQuery={profileQuery}
               workoutSession={workoutSession}
               isFinishingWorkoutSession={isFinishingWorkoutSession}
               completedSetsCount={completedSetsCount}
               onCompletedSetCreated={incrementCompletedSets}
               onCompletedSetDeleted={decrementCompletedSets}
            />
         </ProtectedScreen>

         <DeleteWorkoutSessionDialog 
            visible={isDeleteDialogOpen}
            workoutSession={workoutSession}
            isDeleting={isDeletingWorkoutSession}
            close={() => setIsDeleteDialogOpen(false)}
            onConfirm = {handleConfirmDeleteWorkoutSession}
         />
      </>
   );
}
