import type { WorkoutPlanExercise } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme, type MD3Theme } from 'react-native-paper';

import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import RoutineDetailExercises from '../components/routine-detail/routine-detail-exercises';
import RoutineDetailHero from '../components/routine-detail/routine-detail-hero';
import { useWorkoutPlanExercisesQuery } from '../queries/workout-plan/use-workout-plan-exercises-query';
import { useWorkoutPlanQuery } from '../queries/workout-plan/use-workout-plan-query';

export default function RoutineDetailView() {
   const theme = useTheme();
   const styles = getStyles(theme);

   const params = useLocalSearchParams<{ id?: string }>();
   const workoutPlanId = typeof params.id === 'string' ? params.id : '';

   const workoutPlanQuery = useWorkoutPlanQuery(workoutPlanId);
   const workoutPlan = workoutPlanQuery.data ?? null;

   const exercisesQuery = useWorkoutPlanExercisesQuery(workoutPlanId);
   const exercises = (exercisesQuery.data ?? []) as WorkoutPlanExercise[];

   const handleStartRoutine = () => {
      if (!workoutPlan) return;

      router.push({
         pathname: '/(protected)/training-sessions/[id]/start',
         params: {
            id: workoutPlan.id,
         },
      });
   };

   if (workoutPlanQuery.isLoading) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Cargando rutina...</Text>
         </View>
      );
   }

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
         <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
               <MaterialDesignIcons color={VIEW_COLORS.onDark} name="arrow-left" size={22} />
            </Pressable>

            <Text numberOfLines={1} style={styles.headerTitle}>
               Detalle rutina
            </Text>

            <Pressable onPress={() => router.navigate(`/training-sessions/${workoutPlan.id}/edit`)}>
               <MaterialDesignIcons color="#9EA3AD" name="dots-horizontal" size={24} />
            </Pressable>
         </View>

         <RoutineDetailHero exercises={exercises} workoutPlan={workoutPlan} />
         <RoutineDetailExercises exercises={exercises} />

         <Pressable onPress={handleStartRoutine} style={styles.ctaButton}>
            <Text style={styles.ctaText}>Empezar entrenamiento</Text>
            <MaterialDesignIcons
               color={AUTH_COLORS.primaryForeground}
               name="play"
               size={20}
            />
         </Pressable>
      </ScrollView>
   );
}

const getStyles = (theme: MD3Theme) =>
   StyleSheet.create({
      centerState: {
         alignItems: 'center',
         flex: 1,
         gap: 10,
         justifyContent: 'center',
         padding: 24,
      },
      content: {
         gap: 12,
         paddingBottom: 32,
         paddingTop: 12,
      },
      ctaButton: {
         alignItems: 'center',
         backgroundColor: AUTH_COLORS.primary,
         borderRadius: 16,
         flexDirection: 'row',
         gap: 8,
         height: 52,
         justifyContent: 'center',
         marginTop: 4,
      },
      ctaText: {
         color: AUTH_COLORS.primaryForeground,
         fontSize: 15,
         fontWeight: '900',
      },
      header: {
         alignItems: 'center',
         flexDirection: 'row',
         gap: 12,
         height: 48,
      },
      headerTitle: {
         color: VIEW_COLORS.onDark,
         flex: 1,
         fontSize: 20,
         fontWeight: '800',
      },
      iconButton: {
         alignItems: 'center',
         backgroundColor: '#211F26',
         borderRadius: 21,
         height: 42,
         justifyContent: 'center',
         width: 42,
      },
      stateText: {
         color: VIEW_COLORS.muted,
         textAlign: 'center',
      },
      stateTitle: {
         color: theme.colors.onBackground,
         fontWeight: '800',
         textAlign: 'center',
      },
   });
