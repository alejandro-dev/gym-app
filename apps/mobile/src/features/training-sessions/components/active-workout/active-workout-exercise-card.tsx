import type { WorkoutPlanExercise } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MD3Theme, Text, useTheme } from 'react-native-paper';

import { VIEW_COLORS } from '@/theme/colors';

import { createWorkoutSet, deleteWorkoutSet } from '@/services/api/workoutSetsService';

import { getRestLabel } from '../../utils/active-workout-formatters';
import { formatReps, formatWeight } from '../../utils/routine-detail-formatters';

type ActiveWorkoutExerciseCardProps = {
   exercise: WorkoutPlanExercise;
   workoutSessionId: string;
   isExpanded: boolean;
   onCompletedSetCreated: () => void;
   onCompletedSetDeleted: () => void;
   onToggleExpand: () => void;
   setTotalVolume: Dispatch<SetStateAction<number>>;
};

export default function ActiveWorkoutExerciseCard({
   exercise,
   workoutSessionId,
   isExpanded,
   onCompletedSetCreated,
   onCompletedSetDeleted,
   onToggleExpand,
   setTotalVolume,
}: ActiveWorkoutExerciseCardProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   const [completedSetIds, setCompletedSetIds] = useState<Record<number, string>>({});
   const [loadingSets, setLoadingSets] = useState<Set<number>>(() => new Set());

   const sets = useMemo(
      () => Array.from({ length: Math.max(exercise.targetSets ?? 1, 1) }),
      [exercise.targetSets],
   );

   const weight = formatWeight(exercise.targetWeightKg);
   const reps = formatReps(exercise);
   const restLabel = getRestLabel(exercise);
   const completedSets = Object.keys(completedSetIds).length;
   const allSetsCompleted = completedSets === sets.length && sets.length > 0;
   const compactMeta = [
      `${Math.max(exercise.targetSets ?? 1, 1)} series`,
      reps !== '-' ? `${reps} reps` : null,
      weight !== '-' ? `${weight} kg` : null,
    ]
      .filter(Boolean)
      .join(' • ');
   const completedSetVolume =
      (exercise.targetRepsMax ?? exercise.targetRepsMin ?? 0) *
      (exercise.targetWeightKg ?? 0);

   const toggleSet = async (setIndex: number) => {
      if (loadingSets.has(setIndex)) return;

      setLoadingSets((currentSets) => new Set(currentSets).add(setIndex));

      try {
         const workoutSetId = completedSetIds[setIndex];

         if (workoutSetId) {
            await deleteWorkoutSet(workoutSetId);

            setCompletedSetIds((currentSets) => {
               const nextSets = { ...currentSets };
               delete nextSets[setIndex];
               return nextSets;
            });

            setTotalVolume((currentVolume) => currentVolume - completedSetVolume);
            onCompletedSetDeleted();
            return;
         }

         const createdSet = await createWorkoutSet({
            workoutSessionId,
            exerciseId: exercise.exerciseId,
            setNumber: setIndex + 1,
            reps: exercise.targetRepsMax ?? exercise.targetRepsMin ?? null,
            weightKg: exercise.targetWeightKg ?? null,
            isWarmup: false,
            isCompleted: true,
         });

         setTotalVolume((currentVolume) => currentVolume + completedSetVolume);

         setCompletedSetIds((currentSets) => ({
            ...currentSets,
            [setIndex]: createdSet.id,
         }));

         onCompletedSetCreated();
      } finally {
         setLoadingSets((currentSets) => {
            const nextSets = new Set(currentSets);
            nextSets.delete(setIndex);
            return nextSets;
         });
      }
   };

   if (!isExpanded) {
      return (
         <Pressable onPress={onToggleExpand} style={styles.compactCard}>
            <View
               style={[
                  styles.compactLeading,
                  allSetsCompleted ? styles.compactLeadingDone : styles.compactLeadingIdle,
               ]}
            >
               <MaterialDesignIcons
                  color={allSetsCompleted ? '#111111' : '#9EA3AD'}
                  name={allSetsCompleted ? 'check' : 'circle-outline'}
                  size={16}
               />
            </View>

            <View style={styles.compactCopy}>
               <Text numberOfLines={1} style={styles.compactTitle}>
                  {exercise.exercise.name}
               </Text>
               <Text numberOfLines={1} style={styles.compactMeta}>
                  {compactMeta || 'Sin configuración'}
               </Text>
            </View>
         </Pressable>
      );
   }

   return (
      <View style={styles.expandedCard}>
         <Pressable onPress={onToggleExpand} style={styles.expandedHeader}>
            <View style={styles.headerLeft}>
               <View style={styles.expandedLeading}>
                  <MaterialDesignIcons color="#111111" name="arrow-top-right" size={16} />
               </View>

               <View style={styles.headerCopy}>
                  <Text numberOfLines={1} style={styles.exerciseTitle}>
                     {exercise.exercise.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                     {compactMeta || 'Sin configuración'} • {restLabel}
                  </Text>
               </View>
            </View>

            <MaterialDesignIcons color="#9EA3AD" name="dots-horizontal" size={20} />
         </Pressable>

         <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>SET</Text>
            {exercise.targetWeightKg ? (
               <Text style={[styles.tableHeaderText, styles.tableCenter]}>KG</Text>
            ) : null}
            <Text style={[styles.tableHeaderText, styles.tableCenter]}>REPS</Text>
            <Text style={[styles.tableHeaderText, styles.tableCenter]}>RIR</Text>
            <View style={styles.checkColumn} />
         </View>

         {sets.map((_, index) => {
            const isCompleted = Boolean(completedSetIds[index]);
            const isLoading = loadingSets.has(index);

            return (
               <View key={`${exercise.id}-${index}`} style={styles.setRow}>
                  <Text style={styles.setValue}>{index + 1}</Text>
                  {exercise.targetWeightKg ? (
                     <Text style={[styles.setValue, styles.tableCenter]}>{weight}</Text>
                  ) : null}
                  <Text style={[styles.setValue, styles.tableCenter]}>{reps}</Text>
                  <Text style={[styles.setValue, styles.tableCenter]}>2</Text>
                  <Pressable
                     disabled={isLoading}
                     accessibilityRole="checkbox"
                     accessibilityState={{ checked: isCompleted, disabled: isLoading }}
                     hitSlop={8}
                     onPress={() => toggleSet(index)}
                     style={({ pressed }) => [
                        styles.checkButton,
                        pressed && styles.pressedCheckButton,
                        isLoading && styles.disabledCheckButton,
                     ]}
                  >
                     <View
                        style={[
                           styles.doneBadge,
                           isCompleted ? styles.completedBadge : styles.pendingBadge,
                        ]}
                     >
                        <MaterialDesignIcons
                           color={isCompleted ? '#FFFFFF' : VIEW_COLORS.muted}
                           name="check"
                           size={18}
                        />
                     </View>
                  </Pressable>
               </View>
            );
         })}
      </View>
   );
}

const getStyles = (theme: MD3Theme) =>
   StyleSheet.create({
      checkButton: {
         alignItems: 'center',
         height: 34,
         justifyContent: 'center',
         width: 34,
      },
      checkColumn: {
         width: 34,
      },
      compactCard: {
         alignItems: 'center',
         backgroundColor: '#181A20',
         borderColor: '#2A2E36',
         borderRadius: 14,
         borderWidth: 1,
         flexDirection: 'row',
         gap: 10,
         minHeight: 48,
         paddingHorizontal: 12,
         paddingVertical: 10,
      },
      compactCopy: {
         flex: 1,
         gap: 2,
      },
      compactLeading: {
         alignItems: 'center',
         borderRadius: 10,
         height: 22,
         justifyContent: 'center',
         width: 22,
      },
      compactLeadingDone: {
         backgroundColor: theme.colors.primary,
      },
      compactLeadingIdle: {
         backgroundColor: '#211F26',
      },
      compactMeta: {
         color: '#9EA3AD',
         fontSize: 10,
         lineHeight: 14,
      },
      compactTitle: {
         color: '#FFFFFF',
         fontSize: 14,
         fontWeight: '800',
      },
      completedBadge: {
         backgroundColor: '#16A34A',
      },
      disabledCheckButton: {
         opacity: 0.45,
      },
      doneBadge: {
         alignItems: 'center',
         borderRadius: 10,
         height: 28,
         justifyContent: 'center',
         width: 28,
      },
      expandedCard: {
         backgroundColor: '#1D1B20',
         borderColor: '#34303A',
         borderRadius: 16,
         borderWidth: 1,
         gap: 12,
         padding: 12,
      },
      expandedHeader: {
         alignItems: 'center',
         flexDirection: 'row',
         justifyContent: 'space-between',
      },
      expandedLeading: {
         alignItems: 'center',
         backgroundColor: theme.colors.primary,
         borderRadius: 10,
         height: 24,
         justifyContent: 'center',
         width: 24,
      },
      exerciseMeta: {
         color: '#9EA3AD',
         fontSize: 10,
         lineHeight: 14,
         textTransform: 'uppercase',
      },
      exerciseTitle: {
         color: '#FFFFFF',
         fontSize: 14,
         fontWeight: '800',
      },
      headerCopy: {
         flex: 1,
         gap: 2,
      },
      headerLeft: {
         alignItems: 'center',
         flex: 1,
         flexDirection: 'row',
         gap: 10,
      },
      pendingBadge: {
         backgroundColor: '#211F26',
         borderColor: '#525252',
         borderWidth: 1,
      },
      pressedCheckButton: {
         opacity: 0.7,
      },
      setRow: {
         alignItems: 'center',
         backgroundColor: '#181A20',
         borderRadius: 10,
         flexDirection: 'row',
         gap: 8,
         minHeight: 42,
         paddingHorizontal: 10,
      },
      setValue: {
         color: '#FFFFFF',
         flex: 1,
         fontSize: 13,
         fontWeight: '700',
      },
      tableCenter: {
         textAlign: 'center',
      },
      tableHeader: {
         alignItems: 'center',
         flexDirection: 'row',
         gap: 8,
         paddingHorizontal: 10,
      },
      tableHeaderText: {
         color: '#6F7682',
         flex: 1,
         fontSize: 9,
         fontWeight: '700',
      },
   });
