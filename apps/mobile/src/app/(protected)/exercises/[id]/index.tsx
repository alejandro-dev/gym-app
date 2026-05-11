import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import ExerciseDetailHero from '@/features/exercises/components/exercise-detail-hero';
import ExerciseDetailTabs from '@/features/exercises/components/exercise-detail-tabs';
import { useExerciseQuery } from '@/features/exercises/queries/use-exercise-query';
import ExerciseDetailView, { ExerciseTab } from '@/features/exercises/views/exercise-detail-view';
import { VIEW_COLORS } from '@/theme/colors';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, MD3Theme, useTheme } from 'react-native-paper';

// Vista reutilizable de detalle de ejercicio.
export default function ExerciseDetailScreen() {
   const theme = useTheme();
   const styles = getStyles(theme);

   const [selectedTab, setSelectedTab] = useState<ExerciseTab>('summary');

   
   // Obtenemos el id de la rutina desde la URL.
   const params = useLocalSearchParams<{ id?: string }>();
   const exerciseId = typeof params.id === 'string' ? params.id : '';

   // Cargamos la rutina desde la API.
   const exerciseQuery = useExerciseQuery(exerciseId);
   const exercise = exerciseQuery.data ?? null;

   // Si estamos cargando la rutina, mostramos un indicador de carga.
   if (exerciseQuery.isLoading) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Cargando ejercicio...</Text>
         </View>
      );
   }

   // Si se ha producido un error al cargar la rutina, mostramos un mensaje de error.
   if (exerciseQuery.isError || !exercise) {
      return (
         <View style={styles.centerState}>
            <Text variant="titleMedium" style={styles.stateTitle}>
               No se pudo cargar el ejercicio.
            </Text>
            <Text style={styles.stateText}>
               Vuelve a la rutina e inténtalo de nuevo.
            </Text>
         </View>
      );
   }
   
   return (
      <>
         <ExerciseDetailHero exercise={exercise} />
         <ExerciseDetailTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
         <ProtectedScreen edges={['left', 'right']}>
            <ExerciseDetailView exercise={exercise} selectedTab={selectedTab} />
         </ProtectedScreen>
      </>
      
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 10,
   },
   stateTitle: {
      color: theme.colors.onBackground,
      fontWeight: '800',
      textAlign: 'center',
   },
   stateText: {
      color: VIEW_COLORS.muted,
      textAlign: 'center',
   },
   emptyHero: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   },
   emptyHeroText: {
      color: VIEW_COLORS.subtle,
      fontSize: 54,
      fontWeight: '900',
   },
});
