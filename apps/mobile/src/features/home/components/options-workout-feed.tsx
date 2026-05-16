import { VIEW_COLORS } from '@/theme/colors';
import { BottomSheetView, BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { memo, useMemo, type RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";

interface OptionsWorkoutFeedProps {
	bottomSheetRef: RefObject<BottomSheetModal | null>;
	handleOpenDeleteWorkoutDialog: () => void;
	onChange: (index: number) => void;
}

// Componente de opciones para la vista de rutinas. Mostramos las acciones disponibles para cada rutina.
export const OptionsWorkoutFeed = memo(function OptionsWorkout({
	bottomSheetRef,
	handleOpenDeleteWorkoutDialog,
	onChange,
}: OptionsWorkoutFeedProps) {
	const theme = useTheme();

	// Definimos la altura para el bottom sheet.
	const snapPoints = useMemo(() => ["20%"], []);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			enableDynamicSizing={false}
			enablePanDownToClose
			onChange={onChange}
			backgroundStyle={{ backgroundColor: theme.colors.surface }}
			handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
			backdropComponent={(props) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior="close"
				/>
			)}
		>
			<BottomSheetView style={styles.contentContainer}>
				<Text variant="titleMedium" style={styles.title}>
					Opciones de sesión de entrenamiento
				</Text>
				{/* Aquí viven las acciones que queremos mostrar al pulsar los tres puntos. */}
				<View style={styles.actions}>
					<Divider />
					<List.Item
						titleStyle={styles.titleDelete}
						title="Eliminar entrenamiento"
						onPress={handleOpenDeleteWorkoutDialog}
						left={(props) => (
							<List.Icon {...props} icon="delete-outline" color="#E02020" />
						)}
					/>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
});

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		paddingHorizontal: 0,
		paddingBottom: 24,
		gap: 16,
	},
	title: {
		fontWeight: "700",
		paddingHorizontal: 20,
		color: VIEW_COLORS.onDark,
	},
	actions: {
		borderRadius: 0,
		overflow: "hidden",
	},
	titleDelete: {
		color: "#E02020",
	},
});
