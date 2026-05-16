import type { WorkoutPlanExercise } from '@gym-app/types';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import RoutineDetailExerciseItem from './routine-detail-exercise-item';

type RoutineDetailExercisesProps = {
   exercises: WorkoutPlanExercise[];
};

export default function RoutineDetailExercises({
   exercises,
}: RoutineDetailExercisesProps) {
   const hasExercises = exercises.length > 0;

   return (
      <View style={styles.section}>
         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
         </View>

         {hasExercises ? (
            <View style={styles.exerciseList}>
               {exercises.map((item) => (
                  <RoutineDetailExerciseItem key={item.id} exercise={item} />
               ))}
            </View>
         ) : (
            <View style={styles.emptyCard}>
               <Text style={styles.emptyTitle}>Esta rutina todavía no tiene ejercicios</Text>
               <Text style={styles.emptyText}>
                  Añádelos desde edición para poder empezar el entrenamiento.
               </Text>
            </View>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   emptyCard: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 16,
      borderWidth: 1,
      gap: 4,
      padding: 14,
   },
   emptyText: {
      color: '#9EA3AD',
      fontSize: 12,
      lineHeight: 18,
   },
   emptyTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   exerciseList: {
      gap: 10,
   },
   section: {
      gap: 10,
   },
   sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   sectionTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
   },
});
