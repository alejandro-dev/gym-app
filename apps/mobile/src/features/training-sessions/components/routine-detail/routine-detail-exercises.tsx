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
   return (
      <View style={styles.section}>
         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
         </View>

         <View style={styles.exerciseList}>
            {exercises.map((item) => (
               <RoutineDetailExerciseItem key={item.id} exercise={item} />
            ))}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
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
