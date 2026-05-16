import { VIEW_COLORS } from '@/theme/colors';
import { BottomSheetView, BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
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
   bottomSheetRef: RefObject<BottomSheetModal | null>;
   selectedWorkoutPlan: WorkoutPlan | null;
   handleOpenDeleteWorkoutDialog: () => void;
   handleOpenWorkoutDetail: (id: string) => void;
   handleDuplicateWorkout: (id: string) => void;
   onChange: (index: number) => void;
}

// Componente de opciones para la vista de rutinas. Mostramos las acciones disponibles para cada rutina.
export const OptionsWorkout = memo(function OptionsWorkout({
   bottomSheetRef,
   selectedWorkoutPlan,
   handleOpenDeleteWorkoutDialog,
   handleOpenWorkoutDetail,
   handleDuplicateWorkout,
   onChange,
}: OptionsWorkoutProps) {
   const theme = useTheme();

   // Definimos la altura para el bottom sheet.
   const snapPoints = useMemo(() => ['32%'], []);

   return (
      <BottomSheetModal
         // El sheet se abre en la vista que lo invoca.
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
               Opciones de rutina
            </Text>
            {/* Aquí viven las acciones que queremos mostrar al pulsar los tres puntos. */}
            <View style={styles.actions}>
               <List.Item
                  title="Editar rutina"
                  titleStyle={styles.itemTitle}
                  left={(props) => <List.Icon {...props} icon="pencil-outline" color='#ffffff' />}
                  disabled={!selectedWorkoutPlan}
                  onPress={() => {
                     if (!selectedWorkoutPlan) return;
                     handleOpenWorkoutDetail(selectedWorkoutPlan.id);
                  }}
               />
               <Divider />
               <List.Item
                  title="Duplicar rutina"
                  titleStyle={styles.itemTitle}
                  left={(props) => <List.Icon {...props} icon="content-copy" color='#ffffff' />}
                  disabled={!selectedWorkoutPlan}
                  onPress={() => {
                     if (!selectedWorkoutPlan) return;
                     handleDuplicateWorkout(selectedWorkoutPlan.id);
                  }}
               />
               <Divider />
               <List.Item titleStyle={styles.titleDelete} title="Eliminar rutina" left={(props) => <List.Icon {...props} icon="delete-outline" color='#E02020' />} onPress={handleOpenDeleteWorkoutDialog} />
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
      fontWeight: '700',
      paddingHorizontal: 20,
      color: VIEW_COLORS.onDark,
   },
   itemTitle: {
      color: VIEW_COLORS.onDark,
      fontWeight: '600',
   },
   actions: {
      borderRadius: 0,
      overflow: 'hidden',
   },
   titleDelete: {
      color: '#E02020',
   },
});
