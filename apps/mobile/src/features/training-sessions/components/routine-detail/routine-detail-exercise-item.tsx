import { Pressable, View, StyleSheet } from "react-native";
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { MD3Theme, useTheme, Text } from "react-native-paper";
import { VIEW_COLORS } from "@/theme/colors";
import { formatWeight, formatMetric, formatReps } from "../../utils/routine-detail-formatters";
import { WorkoutPlanExercise } from "@gym-app/types";
import { resolveApiImageUrl } from '@/services/api/media';

type RoutineDetailExerciseItemProps = {
   exercise: WorkoutPlanExercise;
};

// Componente para mostrar un ejercicio en la vista de detalle de rutina.
export default function RoutineDetailExerciseItem({ exercise }: RoutineDetailExerciseItemProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   
   let imageUri = null;
   // Obtenemos la URL de la imagen de ejercicio.
   if (exercise.exercise.imageUrl) imageUri = resolveApiImageUrl(exercise.exercise.imageUrl);
   

   const handlePress = () => {
      router.push({
         pathname: '/(protected)/exercises/[id]',
         params: {
            id: exercise.exercise.id,
         },
      });
   };

   return (
      <Pressable
         onPress={handlePress}
         style={styles.exerciseItem}
      >
         <View style={styles.exerciseHeader}>
            <View style={styles.thumbnail}>
               {imageUri ? (
                  <Image
                     source={{ uri: imageUri }}
                     style={styles.thumbnailImage}
                     contentFit="cover"
                  />
               ) : (
                  <Text style={styles.thumbnailText}>
                     {exercise.exercise.name.slice(0, 2).toUpperCase()}
                  </Text>
               )}
            </View>

            <View style={styles.exerciseInfo}>
               <View style={styles.exerciseTitleRow}>
                  <Text variant="titleMedium" style={styles.exerciseName}>
                     {exercise.exercise.name}
                  </Text>
                  <Text variant="labelSmall" style={styles.dayPill}>
                     Dia {exercise.day ?? 1}
                  </Text>
                  <MaterialDesignIcons
                     name="chevron-right"
                     color={VIEW_COLORS.muted}
                     size={22}
                  />
               </View>
            </View>
         </View>

         <View style={styles.exerciseTable}>
            <View style={styles.tableRow}>
               <Text style={styles.tableHeader}>SERIES</Text>
               <Text style={[styles.tableHeader, styles.tableCenter]}>KG</Text>
               <Text style={[styles.tableHeader, styles.tableRight]}>REPS</Text>
            </View>
            <View style={styles.tableRow}>
               <Text style={styles.tableValue}>{formatMetric(exercise.targetSets)}</Text>
               <Text style={[styles.tableMutedValue, styles.tableCenter]}>
                  {formatWeight(exercise.targetWeightKg)}
               </Text>
               <Text style={[styles.tableMutedValue, styles.tableRight]}>
                  {formatReps(exercise)}
               </Text>
            </View>
         </View>
      </Pressable>
   );
};

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   exerciseItem: {
      gap: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 22,
      borderColor: VIEW_COLORS.softBorder,
      borderWidth: 0.5,
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
   exerciseInfo: {
      flex: 1,
      gap: 8,
   },
   exerciseTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      minHeight: 48,
   },
   exerciseName: {
      flex: 1,
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '900',
   },
   dayPill: {
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: theme.colors.primary,
      color: theme.colors.onPrimary,
      paddingHorizontal: 7,
      paddingVertical: 3,
      fontWeight: '800',
   },
   exerciseTable: {
      gap: 10,
   },
   tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
   },
   tableHeader: {
      flex: 1,
      color: VIEW_COLORS.muted,
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0,
   },
   tableValue: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
   },
   tableMutedValue: {
      flex: 1,
      color: VIEW_COLORS.muted,
      fontSize: 18,
      fontWeight: '700',
   },
   tableCenter: {
      textAlign: 'center',
   },
   tableRight: {
      textAlign: 'right',
   },
});
