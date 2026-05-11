import { resolveApiImageUrl } from "@/services/api/media";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme, MD3Theme, Text, Button } from "react-native-paper";
import { Image } from 'expo-image';
import { formatReps, formatWeight } from "../../utils/routine-detail-formatters";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { WorkoutPlanExercise } from "@gym-app/types";
import { VIEW_COLORS } from "@/theme/colors";
import { getRestLabel } from "../../utils/active-workout-formatters";
import { createWorkoutSet, deleteWorkoutSet } from "@/services/api/workoutSetsService";

type ActiveWorkoutExerciseCardProps = {
   exercise: WorkoutPlanExercise;
   workoutSessionId: string;
   onCompletedSetCreated: () => void;
   onCompletedSetDeleted: () => void;
}

export default function ActiveWorkoutExerciseCard({ exercise, workoutSessionId, onCompletedSetCreated, onCompletedSetDeleted }: ActiveWorkoutExerciseCardProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   const [completedSetIds, setCompletedSetIds] = useState<Record<number, string>>({});
   const [loadingSets, setLoadingSets] = useState<Set<number>>(() => new Set());

   // Seleccionamos o deseleccionamos una serie y actualizamos el estado de la rutina.
   const toggleSet = async (setIndex: number) => {
      // Si ya estamos cargando la serie, no hacemos nada.
      if (loadingSets.has(setIndex)) return;

      // Marcamos la serie como cargando.
      setLoadingSets((currentSets) => new Set(currentSets).add(setIndex));

      try {
         // Obtenemos el id de la serie completada.
         const workoutSetId = completedSetIds[setIndex];

         // Si tenemos el id de la serie completada, eliminamos la serie.
         if (workoutSetId) {
            // Eliminamos la serie de la bd.
            await deleteWorkoutSet(workoutSetId);

            // Actualizamos los ids de las series completadas.
            setCompletedSetIds((currentSets) => {
               const nextSets = { ...currentSets };
               delete nextSets[setIndex];
               return nextSets;
            });

            // Marcamos la serie como no completada.
            onCompletedSetDeleted();

            return;
         }

         // Creamos la serie.
         const createdSet = await createWorkoutSet({
            workoutSessionId,
            exerciseId: exercise.exerciseId,
            setNumber: setIndex + 1,
            reps: exercise.targetRepsMax ?? exercise.targetRepsMin ?? null,
            weightKg: exercise.targetWeightKg ?? null,
            isWarmup: false,
            isCompleted: true,
         });

         // Actualizamos los ids de las series completadas.
         setCompletedSetIds((currentSets) => ({
            ...currentSets,
            [setIndex]: createdSet.id,
         }));

         // Marcamos la serie como completada.
         onCompletedSetCreated();

      } finally {
         // Marcamos la serie como no cargando.
         setLoadingSets((currentSets) => {
            const nextSets = new Set(currentSets);
            nextSets.delete(setIndex);
            return nextSets;
         });
      }
   };


   // Obtenemos la URL de la imagen de ejercicio.
   const imageUri = exercise.exercise.imageUrl
      ? resolveApiImageUrl(exercise.exercise.imageUrl)
      : null;

   // Obtenemos las series de la rutina.
   const sets = Array.from({ length: Math.max(exercise.targetSets ?? 1, 1) });

   // Obtenemos el peso del ejercicio.
   const weight = formatWeight(exercise.targetWeightKg);

   // Obtenemos las del ejercicio.
   const reps = formatReps(exercise);

   // Obtenemos el texto de descanso.
   const restLabel = getRestLabel(exercise);

   return (
      <View style={styles.exerciseBlock}>
         <View style={styles.exerciseHeader}>
            <View style={styles.thumbnail}>
               {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.thumbnailImage} contentFit="cover" />
               ) : (
                  <Text style={styles.thumbnailText}>
                     {exercise.exercise.name.slice(0, 2).toUpperCase()}
                  </Text>
               )}
            </View>
            <Text variant="titleLarge" style={styles.exerciseTitle}>
               {exercise.exercise.name}
            </Text>
            <MaterialDesignIcons
               name="dots-vertical"
               color={theme.colors.onBackground}
               size={24}
            />
         </View>

         <View style={styles.restRow}>
            <MaterialDesignIcons name="timer-outline" color={theme.colors.primary} size={22} />
            <Text style={styles.restText}>Descanso: {restLabel}</Text>
         </View>

         <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>SERIE</Text>
            {exercise.targetWeightKg ? (
               <Text style={[styles.tableHeaderText, styles.tableCenter]}>KG</Text>
            ) : null}
            <Text style={[styles.tableHeaderText, styles.tableCenter]}>REPS</Text>
            <View style={styles.checkColumn}>
               <MaterialDesignIcons name="check" color={VIEW_COLORS.muted} size={22} />
            </View>
         </View>

         {sets.map((_, index) => {
            const isCompleted = Boolean(completedSetIds[index]);
            const isLoading = loadingSets.has(index);
            // const isCompleted = completedSets.has(index);
            const setStateValueStyle = isCompleted
               ? styles.completedSetValue
               : styles.pendingSetValue;

            return (
               <View
                  key={`${exercise.id}-${index}`}
                  style={[
                     styles.setRow,
                     isCompleted ? styles.completedSetRow : styles.pendingSetRow,
                  ]}
               >
                  <Text style={[styles.setValue, setStateValueStyle]}>{index + 1}</Text>
                  {exercise.targetWeightKg ? (
                     <Text style={[styles.setValue, setStateValueStyle, styles.tableCenter]}>
                        {weight}
                     </Text>
                  ) : null}
                  <Text style={[styles.setValue, setStateValueStyle, styles.tableCenter]}>
                     {reps}
                  </Text>
                  {/*<Pressable
                     accessibilityRole="checkbox"
                     accessibilityState={{ checked: isCompleted }}
                     hitSlop={8}
                     onPress={() => toggleSet(index)}
                     style={({ pressed }) => [
                        styles.checkButton,
                        pressed && styles.pressedCheckButton,
                     ]}
                  >*/}
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
                           name="check"
                           color={isCompleted ? "#FFFFFF" : VIEW_COLORS.muted}
                           size={22}
                        />
                     </View>
                  </Pressable>
               </View>
            );
         })}

         <Button
            mode="contained-tonal"
            icon="plus"
            style={styles.addSetButton}
            labelStyle={styles.addSetButtonLabel}
            contentStyle={styles.largeButtonContent}
         >
            Agregar serie
         </Button>
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   exerciseBlock: {
      gap: 14,
   },
   exerciseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
   },
   thumbnail: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: VIEW_COLORS.mediaPlaceholder,
   },

   thumbnailImage: {
      width: '100%',
      height: '100%',
   },
   thumbnailText: {
      color: '#171717',
      fontWeight: '900',
   },
   exerciseTitle: {
      flex: 1,
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '800',
   },
   restRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   restText: {
      color: theme.colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
   },

   tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   tableHeaderText: {
      flex: 1,
      color: VIEW_COLORS.muted,
      fontSize: 13,
      fontWeight: '800',
   },
   tableCenter: {
      textAlign: 'center',
   },
   setRow: {
      minHeight: 56,
      paddingHorizontal: 16,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
   },
   completedSetRow: {
      backgroundColor: theme.colors.primary,
   },
   pendingSetRow: {
      backgroundColor: '#262626',
   },
   setValue: {
      flex: 1,
      fontSize: 20,
      fontWeight: '900',
   },
   completedSetValue: {
      color: theme.colors.onPrimary,
   },
   pendingSetValue: {
      color: '#FFFFFF',
   },

   checkColumn: {
      width: 44,
      alignItems: 'center',
   },
   checkButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
   },
   pressedCheckButton: {
      opacity: 0.7,
   },
   doneBadge: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
   },
   completedBadge: {
      backgroundColor: '#16A34A',
   },
   pendingBadge: {
      borderWidth: 1,
      borderColor: '#525252',
      backgroundColor: '#171717',
   },
   addSetButton: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
   },
   addSetButtonLabel: {
      color: theme.colors.onSurface,
      fontSize: 18,
      fontWeight: '900',
   },
   largeButtonContent: {
      minHeight: 52,
   },
   disabledCheckButton: {
      opacity: 0.45,
   },
});
