import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from '@gym-app/types';
import { Button, Card, Chip, IconButton, Text } from 'react-native-paper';

import type { RoutineExerciseDraft } from '../context/new-routine-context';

interface RoutineExercisesCardProps {
   exercises: RoutineExerciseDraft[];
   onAddExercise: () => void;
   onRemoveExercise: (exerciseId: string) => void;
}

const RoutineExercisesCard = ({
   exercises,
   onAddExercise,
   onRemoveExercise,
}: RoutineExercisesCardProps) => (
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
            <Chip compact>{exercises.length}</Chip>
         </View>

         {exercises.length > 0 ? (
            <View style={styles.exerciseList}>
               {exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                     <View style={styles.exerciseInfo}>
                        <Text variant="titleSmall" style={styles.exerciseName}>
                           {exercise.exerciseName}
                        </Text>
                        <Text variant="bodySmall" style={styles.sectionHint}>
                           Día {exercise.day ?? 1} · Orden {exercise.order}
                        </Text>
                        <View style={styles.chipRow}>
                           <Chip compact>{getMuscleGroupLabelEs(exercise.muscleGroup)}</Chip>
                           <Chip compact>{getExerciseCategoryLabelEs(exercise.category)}</Chip>
                           {exercise.equipment ? (
                              <Chip compact>{exercise.equipment}</Chip>
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
            <View style={styles.emptyState}>
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

export default memo(RoutineExercisesCard);

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
      color: '#64748b',
      lineHeight: 18,
   },
   exerciseList: {
      gap: 10,
   },
   exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      borderCurve: 'continuous',
      backgroundColor: '#e2e8f0',
      paddingLeft: 14,
      paddingVertical: 10,
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
   emptyState: {
      minHeight: 96,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#cbd5e1',
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
