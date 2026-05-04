import { StyleSheet, View } from 'react-native';
import {
   Button,
   Portal,
   Dialog,
   Text,
   useTheme,
   type MD3Theme,
} from 'react-native-paper';
import type { WorkoutPlan } from '@gym-app/types';

interface DeleteWorkoutDialogProps {
   visible: boolean;
   workoutPlan: WorkoutPlan | null;
   isDeleting: boolean;
   close: () => void;
   onConfirm: () => void;
}

// Dialogo para confirmar la eliminación de una rutina.
export const DeleteWorkoutDialog = function DeleteWorkoutDialog({
   visible,
   workoutPlan,
   isDeleting,
   close,
   onConfirm,
}: DeleteWorkoutDialogProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <Portal>
         <Dialog
            onDismiss={isDeleting ? undefined : close}
            visible={visible}
            dismissable={!isDeleting}
            style={styles.dialog}
         >
            <Dialog.Title style={styles.title}>
               ¿Eliminar rutina?
            </Dialog.Title>

            <Dialog.Content>
               <Text style={styles.description}>
                  {workoutPlan
                     ? `Se eliminará permanentemente "${workoutPlan.name}". Esta acción no se puede deshacer.`
                     : 'Esta acción no se puede deshacer.'}
               </Text>
            </Dialog.Content>

            <Dialog.Actions>
               <View style={styles.viewContainer}>
                  <Button
                     style={styles.buttonDelete}
                     labelStyle={styles.buttonLabelDelete}
                     disabled={isDeleting || !workoutPlan}
                     loading={isDeleting}
                     onPress={onConfirm}
                  >
                     {isDeleting ? 'Eliminando...' : 'Borrar rutina'}
                  </Button>

                  <Button
                     style={styles.button}
                     labelStyle={styles.buttonLabel}
                     disabled={isDeleting}
                     onPress={close}
                  >
                     Cancelar
                  </Button>
               </View>
            </Dialog.Actions>
         </Dialog>
      </Portal>
   );
};

const getStyles = (theme: MD3Theme) =>
   StyleSheet.create({
      dialog: {
         backgroundColor: theme.colors.background,
      },
      title: {
         fontSize: 18,
         fontWeight: '600',
         color: '#fff',
         textAlign: 'center',
      },
      description: {
         color: '#A3A3A3',
         textAlign: 'center',
      },
      button: {
         borderRadius: 8,
         backgroundColor: theme.colors.primary,
         width: '100%',
      },
      buttonDelete: {
         borderRadius: 8,
         backgroundColor: theme.colors.surfaceVariant,
         width: '100%',
      },
      buttonLabel: {
         fontSize: 16,
         color: '#fff',
      },
      buttonLabelDelete: {
         fontSize: 16,
         color: '#E02020',
      },
      viewContainer: {
         justifyContent: 'center',
         gap: 12,
         width: '100%',
      },
   });
