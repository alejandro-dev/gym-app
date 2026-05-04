import { StyleSheet, View } from 'react-native';
import {
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from '@gym-app/types';
import { Button, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { getChipColors } from '@/theme/colors';
import { RoutineExerciseDraft } from '../types';
import { VIEW_COLORS } from '@/theme/colors';

interface RoutineExercisesCardProps {
   exercises: RoutineExerciseDraft[];
   onAddExercise: () => void;
   onRemoveExercise: (exerciseId: string) => void;
}

// Componente para mostrar los ejercicios de la rutina y permitir añadir o eliminar ejercicios.
export default function RoutineExercisesCard ({
   exercises,
   onAddExercise,
   onRemoveExercise,
}: RoutineExercisesCardProps){
   const theme = useTheme();
   const chipColors = getChipColors(theme.dark);

   return (
      <Card mode="contained" style={styles.card}>
         <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
               <View style={styles.sectionCopy}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                     Ejercicios
                  </Text>
                  <Text variant="bodySmall" style={styles.sectionHint}>
                     Añade al menos un ejercicio para poder crear la rutina.
                  </Text>
               </View>
               <Chip
                  compact
                  style={[styles.activeChip, { backgroundColor: chipColors.activeBackground }]}
                  textStyle={[styles.chipText, { color: chipColors.activeForeground }]}
               >
                  {exercises.length}
               </Chip>
            </View>

            {exercises.length > 0 ? (
               <View style={styles.exerciseList}>
                  {exercises.map((exercise) => (
                     <View
                        key={exercise.id}
                        style={[
                           styles.exerciseItem,
                           { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                     >
                        <View style={styles.exerciseInfo}>
                           <Text variant="titleSmall" style={styles.exerciseName}>
                              {exercise.exerciseName}
                           </Text>
                           <Text variant="bodySmall" style={styles.sectionHint}>
                              Día {exercise.day ?? 1} · Orden {exercise.order}
                           </Text>
                           <View style={styles.chipRow}>
                              <Chip
                                 textStyle={[styles.chipText, { color: chipColors.foreground }]}
                                 style={[
                                    styles.chip,
                                    {
                                       backgroundColor: chipColors.background,
                                       borderColor: chipColors.border,
                                    },
                                 ]}
                                 compact
                              >
                                 {getMuscleGroupLabelEs(exercise.muscleGroup)}
                              </Chip>
                              <Chip
                                 textStyle={[styles.chipText, { color: chipColors.foreground }]}
                                 style={[
                                    styles.chip,
                                    {
                                       backgroundColor: chipColors.background,
                                       borderColor: chipColors.border,
                                    },
                                 ]}
                                 compact
                              >
                                 {getExerciseCategoryLabelEs(exercise.category)}
                              </Chip>
                              {exercise.equipment ? (
                                 <Chip
                                    textStyle={[styles.chipText, { color: chipColors.foreground }]}
                                    style={[
                                       styles.chip,
                                       {
                                          backgroundColor: chipColors.background,
                                          borderColor: chipColors.border,
                                       },
                                    ]}
                                    compact
                                 >
                                    {exercise.equipment}
                                 </Chip>
                              ) : null}
                           </View>
                        </View>
                        <IconButton
                           icon="delete-outline"
                           size={22}
                           onPress={() => onRemoveExercise(exercise.id)}
                        />
                     </View>
                  ))}
               </View>
            ) : (
               <View style={[styles.emptyState, { borderColor: theme.colors.outline }]}>
                  <Text variant="bodyMedium" style={styles.sectionHint}>
                     Aún no hay ejercicios en este plan.
                  </Text>
               </View>
            )}

            <Button
               mode="outlined"
               icon="plus"
               onPress={onAddExercise}
               contentStyle={styles.buttonContent}
               labelStyle={styles.buttonLabel}
               style={styles.button}
            >
               Añadir ejercicio
            </Button>
         </Card.Content>
      </Card>
   );
}

const styles = StyleSheet.create({
   card: {
      borderRadius: 26,
      borderCurve: 'continuous',
   },
   cardContent: {
      gap: 16,
      paddingVertical: 18,
   },
   sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
   },
   sectionCopy: {
      flex: 1,
      gap: 4,
   },
   sectionTitle: {
      fontWeight: '800',
   },
   sectionHint: {
      color: '#737373',
      lineHeight: 18,
   },
   exerciseList: {
      gap: 10,
      borderRadius: 20,
      borderCurve: 'continuous',
   },
   exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      borderCurve: 'continuous',
      paddingLeft: 14,
      paddingVertical: 10,
      borderWidth: 0.5,
      borderColor: VIEW_COLORS.softBorder,
   },
   exerciseInfo: {
      flex: 1,
      gap: 6,
   },
   exerciseName: {
      fontWeight: '800',
   },
   chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
   },
   chip: {
      borderWidth: 1,
   },
   activeChip: {
      borderWidth: 0,
   },
   chipText: {
      fontWeight: '700',
   },
   emptyState: {
      minHeight: 96,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#E5E5E5',
      padding: 16,
   },
   button: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 52,
   },
   buttonLabel: {
      fontSize: 16,
      fontWeight: '700',
   },
});
