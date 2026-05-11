import { View, StyleSheet } from "react-native";
import { Text, useTheme, MD3Theme } from "react-native-paper";
import { getMuscleGroupLabelEs } from "@gym-app/types";
import { RoutineCatalogExercise } from "@/features/training-sessions/types";
import { VIEW_COLORS } from "@/theme/colors";

type ExerciseDetailHeaderProps = {
   exercise: RoutineCatalogExercise;
};

export default function ExerciseDetailHeader({ exercise }: ExerciseDetailHeaderProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.headerBlock}>
         <Text variant="headlineSmall" style={styles.title}>
            {exercise.name}
         </Text>
         <Text variant="titleMedium" style={styles.subtitle}>
            Primario: {getMuscleGroupLabelEs(exercise.muscleGroup)}
         </Text>
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   headerBlock: {
      gap: 8,
      marginTop: 20,
   },
   title: {
      color: theme.colors.onBackground,
      fontWeight: '900',
      lineHeight: 34,
   },
   subtitle: {
      color: VIEW_COLORS.muted,
      fontWeight: '700',
   },
});