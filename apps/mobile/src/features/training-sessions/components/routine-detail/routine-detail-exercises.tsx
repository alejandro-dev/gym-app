import { WorkoutPlanExercise } from "@gym-app/types";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import RoutineDetailExerciseItem from "./routine-detail-exercise-item";

type RoutineDetailExercisesProps = {
   exercises: WorkoutPlanExercise[];
};

// Componente para mostrar los ejercicios de la rutina en la vista de detalle de rutina.
export default function RoutineDetailExercises({ exercises }: RoutineDetailExercisesProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <>
         <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
               Ejercicios
            </Text>
         </View>

         <View style={styles.exerciseList}>
            {exercises.map((item) => (
               <RoutineDetailExerciseItem
                  key={item.id}
                  exercise={item}
               />
            ))}
         </View>
      </>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   sectionHeader: {
      marginTop: 6,
   },
   sectionTitle: {
      color: '#FFFFFF',
      fontWeight: '900',
   },
   exerciseList: {
      gap: 22,
   },
});   
