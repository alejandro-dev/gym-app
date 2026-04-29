import { memo } from 'react';
import {
   ScrollView,
   StyleSheet,
   View,
} from 'react-native';
import { Image } from 'expo-image';
import { getMuscleGroupLabelEs } from '@gym-app/types';
import {
   ActivityIndicator,
   Card,
   Searchbar,
   Text,
   useTheme,
} from 'react-native-paper';

import { resolveApiImageUrl } from '@/services/api/media';
import useExerciseListView from '../hooks/use-exercise-list-view';
import { RoutineCatalogExercise } from '../types';

const ExerciseListView = () => {
   const theme = useTheme();
   const { exerciseSearch, filteredExercises, isLoading, isError, setExerciseSearch, handleSelectExercise } = useExerciseListView();

   return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
         <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
            <Searchbar
               value={exerciseSearch}
               onChangeText={setExerciseSearch}
               placeholder="Buscar ejercicio"
               placeholderTextColor="#8b8f9a"
               iconColor="#8b8f9a"
               inputStyle={styles.searchInput}
               style={[
                  styles.searchbar,
                  { backgroundColor: theme.colors.surfaceVariant },
               ]}
            />

            <View style={styles.sectionHeader}>
               <Text variant="titleMedium" style={styles.sectionLabel}>
                  Ejercicios populares
               </Text>
               <Text variant="bodySmall" style={styles.resultCount}>
                  {filteredExercises.length}
               </Text>
            </View>

            <ScrollView
               showsVerticalScrollIndicator={false}
               keyboardShouldPersistTaps="handled"
               contentContainerStyle={styles.exerciseList}
            >
               {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                     <ExercisePickerItem
                        key={exercise.id}
                        exercise={exercise}
                        cardColor={theme.colors.surfaceVariant}
                        indicatorColor={theme.colors.primary}
                        onPress={() => handleSelectExercise(exercise)}
                     />
                  ))
               ) : isLoading ? (
                  <View style={styles.emptyState}>
                     <ActivityIndicator animating />
                  </View>
               ) : isError ? (
                  <View style={styles.emptyState}>
                     <Text variant="bodyLarge" style={styles.exerciseSubtitle}>
                        No se pudieron cargar los ejercicios.
                     </Text>
                  </View>
               ) : (
                  <View style={styles.emptyState}>
                     <Text variant="bodyLarge" style={styles.exerciseSubtitle}>
                        No hay ejercicios que coincidan con la búsqueda.
                     </Text>
                  </View>
               )}
            </ScrollView>
         </View>
      </View>
   );
};

export default memo(ExerciseListView);

function ExercisePickerItem({
   exercise,
   cardColor,
   indicatorColor,
   onPress,
}: {
   exercise: RoutineCatalogExercise;
   cardColor: string;
   indicatorColor: string;
   onPress: () => void;
}) {
   return (
      <Card
         mode="contained"
         style={[styles.exerciseItem, { backgroundColor: cardColor }]}
         onPress={onPress}
      >
         <Card.Content style={styles.exerciseItemContent}>
            <ExerciseThumbnail exercise={exercise} />
            <View style={styles.exerciseCopy}>
               <Text variant="titleSmall" style={styles.exerciseName}>
                  {exercise.name}
               </Text>
               <Text variant="bodySmall" style={styles.exerciseSubtitle}>
                  {getMuscleGroupLabelEs(exercise.muscleGroup)}
               </Text>
            </View>
            <View
               style={[
                  styles.selectIndicator,
                  { backgroundColor: indicatorColor },
               ]}
            >
               <Text
                  variant="titleMedium"
                  style={styles.selectIndicatorText}
               >
                  +
               </Text>
            </View>
         </Card.Content>
      </Card>
   );
}

function ExerciseThumbnail({ exercise }: { exercise: RoutineCatalogExercise }) {
   const imageUri = resolveApiImageUrl(exercise.imageUrl);

   if (!imageUri) {
      return (
         <View style={styles.emptyThumbnail}>
            <Text variant="titleLarge" style={styles.emptyThumbnailText}>
               {exercise.name.charAt(0).toUpperCase()}
            </Text>
         </View>
      );
   }

   return (
      <Image
         source={{ uri: imageUri }}
         accessibilityLabel={`Imagen de ${exercise.name}`}
         contentFit="cover"
         style={styles.exerciseThumbnail}
      />
   );
}

const styles = StyleSheet.create({
   screen: {
      flex: 1,
   },
   content: {
      flex: 1,
      gap: 16,
      paddingHorizontal: 20,
      paddingTop: 18,
   },
   searchbar: {
      borderRadius: 18,
      height: 56,
   },
   searchInput: {
      color: '#0f172a',
      fontSize: 16,
      minHeight: 0,
   },
   sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   sectionLabel: {
      color: '#64748b',
      fontWeight: '700',
   },
   resultCount: {
      backgroundColor: '#dbeafe',
      borderRadius: 999,
      color: '#2563eb',
      fontWeight: '800',
      minWidth: 28,
      overflow: 'hidden',
      paddingHorizontal: 9,
      paddingVertical: 4,
      textAlign: 'center',
   },
   exerciseList: {
      gap: 10,
      paddingBottom: 28,
   },
   exerciseItem: {
      borderRadius: 22,
      borderCurve: 'continuous',
   },
   exerciseItemContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      minHeight: 92,
      paddingHorizontal: 10,
      paddingVertical: 10,
   },
   exerciseThumbnail: {
      backgroundColor: '#e2e8f0',
      borderRadius: 18,
      height: 64,
      width: 64,
   },
   emptyThumbnail: {
      alignItems: 'center',
      backgroundColor: '#e2e8f0',
      borderRadius: 18,
      height: 64,
      justifyContent: 'center',
      width: 64,
   },
   emptyThumbnailText: {
      color: '#475569',
      fontWeight: '800',
   },
   exerciseCopy: {
      flex: 1,
      gap: 6,
   },
   exerciseName: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 23,
   },
   exerciseSubtitle: {
      color: '#64748b',
      fontSize: 14,
   },
   selectIndicator: {
      alignItems: 'center',
      borderRadius: 16,
      height: 34,
      justifyContent: 'center',
      width: 34,
   },
   selectIndicatorText: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 22,
   },
   emptyState: {
      alignItems: 'center',
      minHeight: 180,
      justifyContent: 'center',
      paddingHorizontal: 24,
   },
});
