import { StyleSheet, View } from 'react-native';
import { Button, Portal, Dialog, useTheme, type MD3Theme } from 'react-native-paper';

interface DeleteWorkoutDialogProps {
   visible: boolean;
   close: () => void;
}

export const DeleteWorkoutDialog = (function DeleteWorkoutDialog({
   visible,
   close,
}: DeleteWorkoutDialogProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <Portal>
         <Dialog onDismiss={close} visible={visible} dismissable={false} style={styles.dialog}>
            <Dialog.Title style={styles.title}>¿Estás seguro de que quieres eliminar esta rutina?</Dialog.Title>
            <Dialog.Actions>
               <View style={styles.viewContainer}>
                  <Button style={styles.buttonDelete} labelStyle={styles.buttonLabelDelete} onPress={close}>
                     Borrar rutina
                  </Button>
                  <Button style={styles.button} labelStyle={styles.buttonLabel} onPress={close}>
                     Cancelar
                  </Button>
               </View>
            </Dialog.Actions>
         </Dialog>
      </Portal>
   );
});

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
