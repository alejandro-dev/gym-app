import { ScrollView, StyleSheet, View } from 'react-native';
import {
   ActivityIndicator,
   Button,
   Text,
   useTheme,
   type MD3Theme,
} from 'react-native-paper';

import { VIEW_COLORS } from '@/theme/colors';
import ActiveWorkoutExerciseCard from '../components/active-workout/active-workout-exercise-card';
import ActiveWorkoutSummary from '../components/active-workout/active-workout-summary';
import { UseQueryResult } from '@tanstack/react-query';
import { User, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from '@gym-app/types';
import { getTotalSets, getTotalVolume } from '../utils/active-workout-formatters';

type ActiveWorkoutViewProps = {
   workoutPlanQuery: UseQueryResult<WorkoutPlan, Error>;
   exercisesQuery: UseQueryResult<WorkoutPlanExercise[], Error>
   exercises: WorkoutPlanExercise[];
   profileQuery: UseQueryResult<User, Error>;
   workoutSession: WorkoutSession | null;
   isFinishingWorkoutSession: boolean;
   setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
   handleFinishWorkoutSession: () => void;
   onCompletedSetCreated: () => void;
   onCompletedSetDeleted: () => void;
}

// Vista para activar una rutina.
export default function ActiveWorkoutView({ workoutPlanQuery, exercisesQuery, exercises, profileQuery, workoutSession, isFinishingWorkoutSession, setIsDeleteDialogOpen, handleFinishWorkoutSession, onCompletedSetCreated, onCompletedSetDeleted }: ActiveWorkoutViewProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

    // Obtenemos el total de series de las rutinas.
   const totalSets = getTotalSets(exercises);

   // Obtenemos el total de volumen de las rutinas.
   const totalVolume = getTotalVolume(exercises);

   // Evento para eliminar una sesión de entrenamiento.
   const handleDeleteWorkoutSession = () => {
      setIsDeleteDialogOpen(true);
   }

   // Si estamos cargando la rutina, mostramos un indicador de carga.
   if (workoutPlanQuery.isLoading || exercisesQuery.isLoading) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Preparando entrenamiento...</Text>
         </View>
      );
   }

   // Si se ha producido un error al cargar la rutina, mostramos un mensaje de error.
   if (workoutPlanQuery.isError || !workoutPlanQuery.data) {
      return (
         <View style={styles.centerState}>
            <Text variant="titleMedium" style={styles.stateTitle}>
               No se pudo empezar la rutina.
            </Text>
            <Text style={styles.stateText}>Vuelve al detalle e intentalo de nuevo.</Text>
         </View>
      );
   }

   // Si estamos cargando la rutina, mostramos un indicador de carga.
   if (
      workoutPlanQuery.isLoading ||
      exercisesQuery.isLoading ||
      profileQuery.isLoading ||
      !workoutSession
   ) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Preparando entrenamiento...</Text>
         </View>
      );
   }

   return (
      <View style={styles.screen}>
         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
         >
            <View style={styles.summary}>
               <ActiveWorkoutSummary label="Duracion" value="00:42" highlighted />
               <ActiveWorkoutSummary
                  label="Volumen"
                  value={totalVolume > 0 ? `${totalVolume} kg` : '-'}
               />
               <ActiveWorkoutSummary label="Series" value={String(totalSets)} />
            </View>

            <View style={styles.exerciseList}>
               {exercises.map((exercise) => (
                  <ActiveWorkoutExerciseCard key={exercise.id} exercise={exercise} workoutSessionId={workoutSession.id} onCompletedSetCreated={onCompletedSetCreated} onCompletedSetDeleted={onCompletedSetDeleted} />
               ))}
            </View>

            <Button
               mode="contained"
               icon="plus"
               style={styles.addExerciseButton}
               labelStyle={styles.addExerciseButtonLabel}
               contentStyle={styles.largeButtonContent}
            >
               Agregar ejercicio
            </Button>

            <View style={styles.footerActions}>
               <Button
                  mode="contained"
                  style={styles.finishButton}
                  labelStyle={styles.finishButtonLabel}
                  contentStyle={styles.footerButtonContent}
                  loading={isFinishingWorkoutSession}
                  disabled={isFinishingWorkoutSession}
                  onPress={handleFinishWorkoutSession}
               >
                  Terminar
               </Button>

               <Button
                  mode="contained-tonal"
                  style={styles.dangerButton}
                  labelStyle={styles.dangerButtonLabel}
                  contentStyle={styles.footerButtonContent}
                  onPress={handleDeleteWorkoutSession}
               >
                  Descartar entreno
               </Button>
            </View>
         </ScrollView>
      </View>
   );
}
   

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginBottom: 20,
   },
   content: {
      paddingTop: 20,
      paddingBottom: 28,
      gap: 28,
   },
   summary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
   },
   exerciseList: {
      gap: 30,
   },
   largeButtonContent: {
      minHeight: 52,
   },
   addExerciseButton: {
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
   },
   addExerciseButtonLabel: {
      color: theme.colors.onPrimary,
      fontSize: 18,
      fontWeight: '900',
   },
   footerActions: {
      gap: 12,
   },
   finishButton: {
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
   },
   finishButtonLabel: {
      color: theme.colors.onPrimary,
      fontSize: 15,
      fontWeight: '900',
   },
   secondaryButton: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
   },
   dangerButton: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
   },
   secondaryButtonLabel: {
      color: theme.colors.onSurface,
      fontSize: 15,
      fontWeight: '900',
   },
   dangerButtonLabel: {
      color: '#EF4444',
      fontSize: 15,
      fontWeight: '900',
   },
   footerButtonContent: {
      minHeight: 48,
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
      fontWeight: '900',
      textAlign: 'center',
   },
   stateText: {
      color: VIEW_COLORS.muted,
      textAlign: 'center',
   },
});
