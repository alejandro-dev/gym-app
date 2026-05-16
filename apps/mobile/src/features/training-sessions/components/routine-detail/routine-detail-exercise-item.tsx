import type { WorkoutPlanExercise } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type RoutineDetailExerciseItemProps = {
   exercise: WorkoutPlanExercise;
};

export default function RoutineDetailExerciseItem({
   exercise,
}: RoutineDetailExerciseItemProps) {
   const metaParts = [
      exercise.targetSets ? `${exercise.targetSets} series` : null,
      formatReps(exercise),
      exercise.targetWeightKg ? `${Math.round(exercise.targetWeightKg)} kg` : null,
   ].filter(Boolean);

   const handlePress = () => {
      router.push({
         pathname: '/(protected)/exercises/[id]',
         params: {
            id: exercise.exercise.id,
         },
      });
   };

   return (
      <Pressable onPress={handlePress} style={styles.item}>
         <View style={styles.orderBadge}>
            <Text style={styles.orderText}>
               {exercise.order}
            </Text>
         </View>

         <View style={styles.copy}>
            <Text style={styles.name}>{exercise.exercise.name}</Text>
            <Text style={styles.meta}>
               {metaParts.length > 0 ? metaParts.join(' · ') : 'Sin configuración'}
            </Text>
         </View>

         <MaterialDesignIcons color="#9EA3AD" name="chevron-right" size={22} />
      </Pressable>
   );
}

function formatReps(exercise: WorkoutPlanExercise) {
   if (exercise.targetRepsMin && exercise.targetRepsMax) {
      return `${exercise.targetRepsMin}-${exercise.targetRepsMax} reps`;
   }

   if (exercise.targetRepsMin || exercise.targetRepsMax) {
      return `${exercise.targetRepsMin ?? exercise.targetRepsMax} reps`;
   }

   return null;
}

const styles = StyleSheet.create({
   copy: {
      flex: 1,
      gap: 2,
   },
   item: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      padding: 12,
   },
   meta: {
      color: '#9EA3AD',
      fontSize: 11,
      lineHeight: 16,
   },
   name: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   orderBadge: {
      alignItems: 'center',
      backgroundColor: '#FF8400',
      borderRadius: 10,
      height: 34,
      justifyContent: 'center',
      width: 34,
   },
   orderText: {
      color: '#111111',
      fontFamily: 'monospace',
      fontSize: 14,
      fontWeight: '900',
   },
});
