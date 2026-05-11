import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme, type MD3Theme } from 'react-native-paper';

import { VIEW_COLORS } from '@/theme/colors';
import { useWorkoutPlanExercisesQuery } from '../queries/workout-plan/use-workout-plan-exercises-query';
import { useWorkoutPlanQuery } from '../queries/workout-plan/use-workout-plan-query';
import RoutineDetailHero from '../components/routine-detail/routine-detail-hero';
import RoutineDetailExercises from '../components/routine-detail/routine-detail-exercises';
import { WorkoutPlanExercise } from '@gym-app/types';

// Pantalla maqueta para consultar la informacion completa de una rutina.
export default function RoutineDetailView() {
   const theme = useTheme();
   const styles = getStyles(theme);

   // Obtenemos el id de la rutina desde la URL.
   const params = useLocalSearchParams<{ id?: string }>();
   const workoutPlanId = typeof params.id === 'string' ? params.id : '';
   
   // Cargamos la rutina desde la API.
   const workoutPlanQuery = useWorkoutPlanQuery(workoutPlanId);
   const workoutPlan = workoutPlanQuery.data ?? null;

   // Cargamos los ejercicios de la rutina desde la API.
   const exercisesQuery = useWorkoutPlanExercisesQuery(workoutPlanId);
   const exercises = exercisesQuery.data as WorkoutPlanExercise[];

   // Si estamos cargando la rutina, mostramos un indicador de carga.
   if (workoutPlanQuery.isLoading) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Cargando rutina...</Text>
         </View>
      );
   }

   // Si se ha producido un error al cargar la rutina, mostramos un mensaje de error.
   if (workoutPlanQuery.isError || !workoutPlan) {
      return (
         <View style={styles.centerState}>
            <Text style={styles.stateTitle}>No se pudo cargar la rutina.</Text>
            <Text style={styles.stateText}>
               Vuelve al listado e intentalo de nuevo.
            </Text>
         </View>
      );
   }

   return (
      <ScrollView
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.content}
      >
         <RoutineDetailHero workoutPlan={workoutPlan} />
         <RoutineDetailExercises exercises={exercises ?? []} />
      </ScrollView>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   content: {
      paddingTop: 20,
      paddingBottom: 48,
      gap: 22,
   },
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
   title: {
      color: theme.colors.onBackground,
      fontWeight: '900',
   },   
});
