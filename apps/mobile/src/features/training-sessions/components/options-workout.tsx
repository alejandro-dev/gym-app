import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type { WorkoutPlan } from '@gym-app/types';
import { memo, useMemo, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import {
   Divider,
   List,
   Text,
   useTheme,
} from 'react-native-paper';

interface OptionsWorkoutProps {
   bottomSheetRef: RefObject<BottomSheet | null>;
   selectedWorkoutPlan: WorkoutPlan | null;
   handleOpenDeleteWorkoutDialog: () => void;
   handleOpenWorkoutDetail: (id: string) => void;
}

// Componente de opciones para la vista de rutinas. Mostramos las acciones disponibles para cada rutina.
export const OptionsWorkout = memo(function OptionsWorkout({
   bottomSheetRef,
   selectedWorkoutPlan,
   handleOpenDeleteWorkoutDialog,
   handleOpenWorkoutDetail,
}: OptionsWorkoutProps) {
   const theme = useTheme();

   // Definimos la altura para el bottom sheet.
   const snapPoints = useMemo(() => ['32%'], []);

   return (
      <BottomSheet
         // El sheet se abre en la vista que lo invoca.
         ref={bottomSheetRef}
         // El sheet arranca cerrado 
         index={-1}
         snapPoints={snapPoints}
         enablePanDownToClose
         backgroundStyle={{ backgroundColor: theme.colors.surface }}
         handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
      >
         <BottomSheetView style={styles.contentContainer}>
            <Text variant="titleMedium" style={styles.title}>
               Opciones de rutina
            </Text>
            {/* Aquí viven las acciones que queremos mostrar al pulsar los tres puntos. */}
            <View style={styles.actions}>
               <List.Item
                  title="Editar rutina"
                  left={(props) => <List.Icon {...props} icon="pencil-outline" />}
                  disabled={!selectedWorkoutPlan}
                  onPress={() => {
                     if (!selectedWorkoutPlan) return;
                     handleOpenWorkoutDetail(selectedWorkoutPlan.id);
                  }}
               />
               <Divider />
               <List.Item title="Duplicar rutina" left={(props) => <List.Icon {...props} icon="content-copy" />} />
               <Divider />
               <List.Item titleStyle={styles.titleDelete} title="Eliminar rutina" left={(props) => <List.Icon {...props} icon="delete-outline" color='#E02020' />} onPress={handleOpenDeleteWorkoutDialog} />
            </View>
         </BottomSheetView>
      </BottomSheet>
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
      fontWeight: '700',
      paddingHorizontal: 20,
   },
   actions: {
      borderRadius: 0,
      overflow: 'hidden',
   },
   titleDelete: {
      color: '#E02020',
   },
});
