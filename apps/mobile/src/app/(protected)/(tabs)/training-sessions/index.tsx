import BottomSheet from '@gorhom/bottom-sheet';
import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import { OptionsWorkout } from '@/features/training-sessions/components/options-workout';
import TrainingSessionsView from '@/features/training-sessions/views/training-sessions-view';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { DeleteWorkoutDialog } from '@/features/training-sessions/components/delete-workout-dialog';

export default function WorkoutsScreen() {
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

   // Referencia para controlar el Bottom Sheet desde la vista de sesiones de entrenamiento.
   const bottomSheetRef = useRef<BottomSheet>(null);

   // Evento para abrir el dialogo cuando se quiere eliminar una rutina.
   const handleOpenDeleteWorkoutDialog = () => {
      // Cerramos el Bottom Sheet para mostrar el dialogo.
      bottomSheetRef.current?.close();

      // Abrimos el dialogo para mostrar el cuadro de diálogo.
      setIsDeleteDialogOpen(true);
   };

   return (
      <>
         <ProtectedScreen style={styles.safeArea}>
            <TrainingSessionsView bottomSheetRef={bottomSheetRef} />
         </ProtectedScreen>
         <OptionsWorkout 
            bottomSheetRef={bottomSheetRef} 
            handleOpenDeleteWorkoutDialog={handleOpenDeleteWorkoutDialog}
         />
         <DeleteWorkoutDialog visible={isDeleteDialogOpen} close={() => setIsDeleteDialogOpen(false)} />
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
