import { StyleSheet, View } from 'react-native';
import {
   Button,
   Portal,
   Dialog,
   Text,
   useTheme,
   type MD3Theme,
} from 'react-native-paper';
import type { WorkoutSession } from '@gym-app/types';

// Solo se necesita el id y el nombre de la sesión de entrenamiento para poder eliminarla.
type DeletableWorkoutSession = Pick<WorkoutSession, "id" | "name">;

interface DeleteWorkoutSessionDialogProps {
   visible: boolean;
   workoutSession: DeletableWorkoutSession | null;
   isDeleting: boolean;
   close: () => void;
   onConfirm: () => void;
}

// Dialogo para confirmar la eliminación de una rutina.
export default function DeleteWorkoutSessionDialog({
   visible,
   workoutSession,
   isDeleting,
   close,
   onConfirm,
}: DeleteWorkoutSessionDialogProps) {
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
               ¿Eliminar la sesión?
            </Dialog.Title>

            <Dialog.Content>
               <Text style={styles.description}>
                  {workoutSession
                     ? `Se eliminará permanentemente la sesión "${workoutSession.name}". Esta acción no se puede deshacer.`
                     : 'Esta acción no se puede deshacer.'}
               </Text>
            </Dialog.Content>

            <Dialog.Actions>
               <View style={styles.viewContainer}>
                  <Button
                     style={styles.buttonDelete}
                     labelStyle={styles.buttonLabelDelete}
                     disabled={isDeleting || !workoutSession}
                     loading={isDeleting}
                     onPress={onConfirm}
                  >
                     {isDeleting ? 'Eliminando...' : 'Borrar sesión'}
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
         color: theme.colors.surfaceVariant,
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
