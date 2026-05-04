import BottomSheet from '@gorhom/bottom-sheet';
import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import { OptionsWorkout } from '@/features/training-sessions/components/options-workout';
import TrainingSessionsView from '@/features/training-sessions/views/training-sessions-view';
import { useRef, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { DeleteWorkoutDialog } from '@/features/training-sessions/components/delete-workout-dialog';
import type { WorkoutPlan } from '@gym-app/types';
import { useRouter } from 'expo-router';
import { ApiError } from '@/services/api/client';
import { useDeleteRoutineMutation } from '@/features/training-sessions/mutations/use-delete-routine-mutation';


export default function WorkoutsScreen() {
   const router = useRouter();
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
   const [selectedWorkoutPlan, setSelectedWorkoutPlan] =
      useState<WorkoutPlan | null>(null);
   const deleteRoutineMutation = useDeleteRoutineMutation();

   // Referencia para controlar el Bottom Sheet desde la vista de sesiones de entrenamiento.
   const bottomSheetRef = useRef<BottomSheet>(null);

   // Evento para abrir el bottom sheet de opciones de la rutina. Seleccionamos el plan de entrenamiento elegido.
   const handleOpenWorkoutOptions = (workoutPlan: WorkoutPlan) => {
      setSelectedWorkoutPlan(workoutPlan);
      bottomSheetRef.current?.snapToIndex(0);
   };

   // Evento para redireccionar al detalle de la rutina.
   const handleOpenWorkoutDetail = (id: string) => {
      // Cerramos el Bottom Sheet antes de navegar.
      bottomSheetRef.current?.close();
      router.navigate(`/training-sessions/${id}/edit`);
   };

   // Evento para abrir el dialogo cuando se quiere eliminar una rutina.
   const handleOpenDeleteWorkoutDialog = () => {
      // Cerramos el Bottom Sheet para mostrar el dialogo.
      bottomSheetRef.current?.close();

      // Abrimos el dialogo para mostrar el cuadro de diálogo.
      setIsDeleteDialogOpen(true);
   };

   // Evento para confirmar la eliminación de una rutina.
   const handleConfirmDeleteWorkout = async () => {
      if (!selectedWorkoutPlan) return;

      try {
         await deleteRoutineMutation.mutateAsync(selectedWorkoutPlan.id);

         setIsDeleteDialogOpen(false);
         setSelectedWorkoutPlan(null);

         Alert.alert(
            'Rutina eliminada',
            'La rutina se ha eliminado correctamente.',
         );
      } catch (error) {
         const message =
            error instanceof ApiError
               ? error.message
               : 'No se pudo eliminar la rutina. Inténtalo de nuevo.';

         Alert.alert('Error', message);
      }
   };

   // Evento para abrir el dialogo para duplicar una rutina.
   const handleDuplicateWorkout = (id: string) => {
      bottomSheetRef.current?.close();
      router.navigate(`/training-sessions/${id}/duplicate`);
   };

   return (
      <>
         <ProtectedScreen style={styles.safeArea}>
            <TrainingSessionsView
               onOpenWorkoutOptions={handleOpenWorkoutOptions}
            />
         </ProtectedScreen>
         
         <OptionsWorkout 
            bottomSheetRef={bottomSheetRef} 
            selectedWorkoutPlan={selectedWorkoutPlan}
            handleOpenDeleteWorkoutDialog={handleOpenDeleteWorkoutDialog}
            handleOpenWorkoutDetail={handleOpenWorkoutDetail}
            handleDuplicateWorkout={handleDuplicateWorkout}
         />
        
         <DeleteWorkoutDialog
            visible={isDeleteDialogOpen}
            workoutPlan={selectedWorkoutPlan}
            isDeleting={deleteRoutineMutation.isPending}
            close={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleConfirmDeleteWorkout}
         />
      </>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,

   },
   content: {
      gap: 12,
   },
});
