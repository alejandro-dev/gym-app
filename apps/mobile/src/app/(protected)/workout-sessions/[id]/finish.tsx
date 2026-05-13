
import { ProtectedScreen } from "@/components/layout/ProtectedScreen";
import DeleteWorkoutSessionDialog from "@/features/training-sessions/components/active-workout/delete-workout-session-dialog";
import WorkoutDetailFinishView from "@/features/training-sessions/views/workout-detail-finish";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme, Button, Text } from "react-native-paper";
import { Stack } from "expo-router";
import useFinishWorkoutScreen from "@/features/training-sessions/hooks/use-finish-workout-screen";

export default function WorkoutDetailFinishScreen() {
   const theme = useTheme();

   const { 
      workoutSession,
      isDeleteDialogOpen,
      isDeletingWorkoutSession,
      isFinishingWorkoutSession,
      notes,
      setIsDeleteDialogOpen,
      handleConfirmDeleteWorkoutSession,
      handleFinishWorkoutSession,
      setNotes,
   } = useFinishWorkoutScreen();
   
   // Si no hay sesión de entrenamiento, no mostramos la pantalla.
   if (!workoutSession) {
      return (
         <View style={styles.loading}>
            <ActivityIndicator />
            <Text variant="bodyMedium">Cargando sesión...</Text>
         </View>
      );
   }

	return (
      <>
         <Stack.Screen
            options={{
               headerRight: () => (
                  <Button
                     mode="contained"
                     compact
                     loading={isFinishingWorkoutSession}
                     onPress={handleFinishWorkoutSession}
                     style={[{borderRadius: 12}]}
                  >
                     Guardar
                  </Button>
               ),
            }}
         />
         <ProtectedScreen
            edges={["left", "right"]}
            style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
         >
            <WorkoutDetailFinishView workoutSession={workoutSession} setIsDeleteDialogOpen={setIsDeleteDialogOpen} notes={notes} onNotes={setNotes} />
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

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
   },
   loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingTop: 48,
   },
});
