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
      exercise.restSeconds ? `${exercise.restSeconds}s` : null,
      exercise.targetWeightKg ? `${Math.round(exercise.targetWeightKg)} kg` : null,
   ].filter(Boolean);

   const isPrimary = exercise.order === 1;

   const handlePress = () => {
      router.push({
         pathname: '/(protected)/exercises/[id]',
         params: {
            id: exercise.exercise.id,
         },
      });
   };

   return (
      <Pressable onPress={handlePress} style={[styles.item, isPrimary ? styles.itemPrimary : styles.itemSecondary]}>
         <View style={[styles.orderBadge, isPrimary ? styles.orderBadgePrimary : styles.orderBadgeSecondary]}>
            <Text style={[styles.orderText, isPrimary ? styles.orderTextPrimary : styles.orderTextSecondary]}>
               {exercise.order}
            </Text>
         </View>

         <View style={styles.copy}>
            <Text style={styles.name}>{exercise.exercise.name}</Text>
            <Text style={styles.meta}>
               {metaParts.length > 0 ? metaParts.join(' · ') : 'Sin configuración'}
            </Text>
         </View>

         {isPrimary ? (
            <MaterialDesignIcons color="#9EA3AD" name="chevron-right" size={22} />
         ) : null}
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
      borderRadius: 16,
      flexDirection: 'row',
      gap: 10,
      padding: 12,
   },
   itemPrimary: {
      backgroundColor: '#1D1B20',
      borderColor: '#34303A',
      borderWidth: 1,
   },
   itemSecondary: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderWidth: 1,
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
      borderRadius: 10,
      height: 34,
      justifyContent: 'center',
      width: 34,
   },
   orderBadgePrimary: {
      backgroundColor: '#FF8400',
   },
   orderBadgeSecondary: {
      backgroundColor: '#211F26',
   },
   orderText: {
      fontFamily: 'monospace',
      fontSize: 14,
      fontWeight: '900',
   },
   orderTextPrimary: {
      color: '#111111',
   },
   orderTextSecondary: {
      color: '#FFFFFF',
   },
});
