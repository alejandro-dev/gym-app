import { ProtectedScreen } from "@/components/layout/ProtectedScreen";
import { OptionsWorkoutFeed } from "@/features/home/components/options-workout-feed";
import HomeView from "@/features/home/views/home-view";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function ProtectedHomeScreen() {
  const theme = useTheme();

  // Referencia para controlar el Bottom Sheet desde la vista de sesiones de entrenamiento.
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Evento para abrir el bottom sheet de opciones de la rutina. Seleccionamos el plan de entrenamiento elegido.
  const handleOpenWorkoutOptions = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  // Evento para abrir el dialogo cuando se quiere eliminar una rutina.
  const handleOpenDeleteWorkoutDialog = () => {
    // Abrimos el bottom sheet para mostrar el cuadro de diálogo.
    bottomSheetRef.current?.close();
  };

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
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
