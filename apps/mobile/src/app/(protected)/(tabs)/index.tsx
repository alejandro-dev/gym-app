import { ProtectedScreen } from "@/components/layout/ProtectedScreen";
import { DeleteWorkoutSessionDialog } from "@/features/home/components/delete-workout-session-dialog";
import { OptionsWorkoutFeed } from "@/features/home/components/options-workout-feed";
import { useDeleteSessionMutation } from "@/features/home/mutations/use-delete-session-mutation";
import HomeView from "@/features/home/views/home-view";
import { ApiError } from "@/services/api/client";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { WorkoutSessionFeedItem } from "@gym-app/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, BackHandler } from "react-native";
import { useTheme } from "react-native-paper";

export default function ProtectedHomeScreen() {
	const theme = useTheme();

	// Referencia para controlar el Bottom Sheet desde la vista de sesiones de entrenamiento.
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	// Estado para mostrar el cuadro de diálogo de eliminación.
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [selectedWorkoutSession, setSelectedWorkoutSession] = useState<WorkoutSessionFeedItem | null>(null);
	const [isOptionsSheetOpen, setIsOptionsSheetOpen] = useState(false);

	// Mutación para eliminar un entrenamiento.
	const deleteSessionMutation = useDeleteSessionMutation();

	// Evento para abrir el bottom sheet de opciones de la rutina. Seleccionamos el plan de entrenamiento elegido.
	const handleOpenWorkoutOptions = (workoutSession: WorkoutSessionFeedItem) => {
		setSelectedWorkoutSession(workoutSession);
		setIsOptionsSheetOpen(true);
		bottomSheetRef.current?.present();
	};

	// Evento para abrir el dialogo cuando se quiere eliminar una rutina.
	const handleOpenDeleteWorkoutDialog = () => {
		// Cerramos el Bottom Sheet para mostrar el dialogo.
		bottomSheetRef.current?.dismiss();

		// Abrimos el dialogo para mostrar el cuadro de diálogo.
		setIsDeleteDialogOpen(true);
	};

	// Evento para confirmar la eliminación de un entrenamiento.
	const handleConfirmDeleteWorkoutSession = async () => {
		if (!selectedWorkoutSession) return;

		try {
			await deleteSessionMutation.mutateAsync(selectedWorkoutSession.id);

			setIsDeleteDialogOpen(false);
			setSelectedWorkoutSession(null);

			Alert.alert(
				'Entrenamiento eliminado',
				'El entrenamiento se ha eliminado correctamente.',
			);
		} catch (error) {
			const message =
				error instanceof ApiError
					? error.message
					: 'No se pudo eliminar el entrenamiento. Inténtalo de nuevo.';

			Alert.alert('Error', message);
		}
	};

	// Evento para cerrar el sheet de opciones cuando se pulsa el botón de atras.
	useFocusEffect(
		useCallback(() => {
			// Si el sheet de opciones está abierto, se cierra.
			const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
				if (!isOptionsSheetOpen) {
					return false;
				}

				bottomSheetRef.current?.dismiss();
				setIsOptionsSheetOpen(false);
				return true;
			});

			return () => subscription.remove();
		}, [isOptionsSheetOpen]),
	);

	return (
		<>
			<ProtectedScreen
				style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
			>
				<HomeView onOpenWorkoutOptions={handleOpenWorkoutOptions} />
			</ProtectedScreen>

			<OptionsWorkoutFeed
				bottomSheetRef={bottomSheetRef}
				handleOpenDeleteWorkoutDialog={handleOpenDeleteWorkoutDialog}
				onChange={(index) => setIsOptionsSheetOpen(index >= 0)}
			/>

			<DeleteWorkoutSessionDialog
				visible={isDeleteDialogOpen}
				workoutSession={selectedWorkoutSession}
				isDeleting={deleteSessionMutation.isPending}
				close={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDeleteWorkoutSession}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
});
