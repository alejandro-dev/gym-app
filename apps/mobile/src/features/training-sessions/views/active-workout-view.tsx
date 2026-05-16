import type { UseQueryResult } from '@tanstack/react-query';
import type { User, WorkoutPlan, WorkoutPlanExercise, WorkoutSession } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
   ActivityIndicator,
   Button,
   Text,
   useTheme,
   type MD3Theme,
} from 'react-native-paper';

import { formatStopwatch } from '@/features/home/utils/utils';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import ActiveWorkoutExerciseCard from '../components/active-workout/active-workout-exercise-card';

type ActiveWorkoutViewProps = {
   workoutPlanQuery: UseQueryResult<WorkoutPlan, Error>;
   exercisesQuery: UseQueryResult<WorkoutPlanExercise[], Error>;
   exercises: WorkoutPlanExercise[];
   profileQuery: UseQueryResult<User, Error>;
   workoutSession: WorkoutSession | null;
   isFinishingWorkoutSession: boolean;
   completedSetsCount: number;
   elapsedSeconds: number;
   setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
   handleGoDetailFinishScreen: () => void;
   onCompletedSetCreated: () => void;
   onCompletedSetDeleted: () => void;
};

export default function ActiveWorkoutView({
   workoutPlanQuery,
   exercisesQuery,
   exercises,
   profileQuery,
   workoutSession,
   isFinishingWorkoutSession,
   completedSetsCount,
   elapsedSeconds,
   setIsDeleteDialogOpen,
   handleGoDetailFinishScreen,
   onCompletedSetCreated,
   onCompletedSetDeleted,
}: ActiveWorkoutViewProps) {
   const theme = useTheme();
   const insets = useSafeAreaInsets();
   const styles = getStyles(theme);
   const [totalVolume, setTotalVolume] = useState(0);
   const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

   const handleDeleteWorkoutSession = () => {
      setIsDeleteDialogOpen(true);
   };

   if (workoutPlanQuery.isLoading || exercisesQuery.isLoading) {
      return (
         <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Preparando entrenamiento...</Text>
         </View>
      );
   }

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

   const selectedExerciseId = expandedExerciseId ?? exercises[0]?.id ?? null;

   const stats = [
      {
         accent: true,
         label: 'duración',
         value: formatStopwatch(elapsedSeconds),
      },
      {
         accent: false,
         label: 'volumen',
         value: formatVolumeCompact(totalVolume),
      },
      {
         accent: false,
         label: 'series',
         value: String(completedSetsCount),
      },
   ];

   return (
      <View style={styles.screen}>
         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
               styles.content,
               { paddingBottom: Math.max(insets.bottom, 16) + 104 },
            ]}
         >
            <View style={styles.header}>
               <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>WORKOUT SESSION</Text>
                  <Text numberOfLines={1} style={styles.title}>
                     {workoutPlanQuery.data.name}
                  </Text>
               </View>

               <Pressable
                  accessibilityLabel="Descartar entrenamiento"
                  onPress={handleDeleteWorkoutSession}
                  style={styles.closeButton}
               >
                  <MaterialDesignIcons color="#EF4444" name="close" size={18} />
               </Pressable>
            </View>

            <View style={styles.statsRow}>
               {stats.map((stat) => (
                  <View
                     key={stat.label}
                     style={[styles.statCard, stat.accent && styles.statCardAccent]}
                  >
                     <Text style={[styles.statValue, stat.accent && styles.statValueAccent]}>
                        {stat.value}
                     </Text>
                     <Text style={[styles.statLabel, stat.accent && styles.statLabelAccent]}>
                        {stat.label}
                     </Text>
                  </View>
               ))}
            </View>

            <View style={styles.exerciseList}>
               {exercises.map((exercise) => (
                  <ActiveWorkoutExerciseCard
                     key={exercise.id}
                     exercise={exercise}
                     isExpanded={selectedExerciseId === exercise.id}
                     workoutSessionId={workoutSession.id}
                     onCompletedSetCreated={onCompletedSetCreated}
                     onCompletedSetDeleted={onCompletedSetDeleted}
                     onToggleExpand={() => setExpandedExerciseId(exercise.id)}
                     setTotalVolume={setTotalVolume}
                  />
               ))}
            </View>
         </ScrollView>

         <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Button
               mode="contained"
               style={styles.finishButton}
               labelStyle={styles.finishButtonLabel}
               contentStyle={styles.footerButtonContent}
               loading={isFinishingWorkoutSession}
               disabled={isFinishingWorkoutSession}
               onPress={handleGoDetailFinishScreen}
            >
               Terminar
            </Button>

            <Button
               mode="contained-tonal"
               style={styles.discardButton}
               labelStyle={styles.discardButtonLabel}
               contentStyle={styles.footerButtonContent}
               onPress={handleDeleteWorkoutSession}
            >
               Descartar entreno
            </Button>
         </View>
      </View>
   );
}

function formatVolumeCompact(value: number) {
   if (value <= 0) return '-';

   if (value >= 1000) {
      const compactValue = value / 1000;
      const formatted =
         compactValue >= 10
            ? Math.round(compactValue).toString()
            : compactValue.toFixed(1).replace(/\.0$/, '');

      return `${formatted}k`;
   }

   return String(Math.round(value));
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
      closeButton: {
         alignItems: 'center',
         backgroundColor: '#211F26',
         borderRadius: 18,
         height: 36,
         justifyContent: 'center',
         width: 36,
      },
      content: {
         gap: 18,
         paddingBottom: 28,
         paddingTop: 12,
      },
      discardButton: {
         backgroundColor: '#211F26',
         borderRadius: 14,
      },
      discardButtonLabel: {
         color: '#EF4444',
         fontSize: 13,
         fontWeight: '900',
      },
      exerciseList: {
         gap: 10,
      },
      eyebrow: {
         color: AUTH_COLORS.primary,
         fontFamily: 'monospace',
         fontSize: 10,
         fontWeight: '700',
         letterSpacing: 0.8,
      },
      finishButton: {
         backgroundColor: AUTH_COLORS.primary,
         borderRadius: 14,
      },
      finishButtonLabel: {
         color: AUTH_COLORS.primaryForeground,
         fontSize: 14,
         fontWeight: '900',
      },
      footer: {
         backgroundColor: theme.colors.background,
         gap: 8,
         paddingTop: 12,
      },
      footerButtonContent: {
         minHeight: 44,
      },
      header: {
         alignItems: 'center',
         flexDirection: 'row',
         gap: 12,
         justifyContent: 'space-between',
      },
      headerCopy: {
         flex: 1,
         gap: 2,
      },
      screen: {
         backgroundColor: theme.colors.background,
         flex: 1,
      },
      stateText: {
         color: VIEW_COLORS.muted,
         textAlign: 'center',
      },
      stateTitle: {
         color: theme.colors.onBackground,
         fontWeight: '900',
         textAlign: 'center',
      },
      statCard: {
         backgroundColor: '#211F26',
         borderRadius: 12,
         flex: 1,
         gap: 2,
         padding: 10,
      },
      statCardAccent: {
         backgroundColor: AUTH_COLORS.helpSurface,
      },
      statLabel: {
         color: '#9EA3AD',
         fontSize: 10,
      },
      statLabelAccent: {
         color: '#B8BCC6',
      },
      statValue: {
         color: VIEW_COLORS.onDark,
         fontFamily: 'monospace',
         fontSize: 20,
         fontWeight: '800',
      },
      statValueAccent: {
         color: AUTH_COLORS.primary,
      },
      statsRow: {
         flexDirection: 'row',
         gap: 8,
      },
      title: {
         color: VIEW_COLORS.onDark,
         fontSize: 28,
         fontWeight: '800',
      },
   });
