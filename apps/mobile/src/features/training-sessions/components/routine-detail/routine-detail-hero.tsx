import { getChipColors, VIEW_COLORS } from "@/theme/colors";
import { WorkoutPlan } from "@gym-app/types";
import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Button, Chip, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { formatGoal, formatLevel } from "../../utils/routine-detail-formatters";

type RoutineDetailHeroProps = {
   workoutPlan: WorkoutPlan;
};

// Componente para mostrar el hero de la vista de detalle de rutina.
export default function RoutineDetailHero({ workoutPlan }: RoutineDetailHeroProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   const chipColors = getChipColors(theme.dark);

   const handleStartRoutine = () => {
      router.push({
         pathname: '/(protected)/training-sessions/[id]/start',
         params: {
            id: workoutPlan.id,
         },
      });
   };
   
   return (
      <View style={styles.hero}>
         <Text variant="labelLarge" style={styles.eyebrow}>
            Vista de rutina
         </Text>
         <Text variant="headlineSmall" style={styles.title}>
            {workoutPlan.name}
         </Text>
         <Text variant="bodyMedium" style={styles.description}>
            {workoutPlan.description?.trim() ||
               'Resumen breve de la rutina, indicaciones principales y foco del bloque de entrenamiento.'}
         </Text>

         <View style={styles.chipRow}>
            <Chip
               compact
               style={[
                  styles.chip,
                  {
                     backgroundColor: chipColors.background,
                     borderColor: chipColors.border,
                  },
               ]}
               textStyle={[styles.chipText, { color: chipColors.foreground }]}
            >
               {formatGoal(workoutPlan)}
            </Chip>
            <Chip
               compact
               style={[
                  styles.chip,
                  {
                     backgroundColor: chipColors.background,
                     borderColor: chipColors.border,
                  },
               ]}
               textStyle={[styles.chipText, { color: chipColors.foreground }]}
            >
               {formatLevel(workoutPlan)}
            </Chip>
            <Chip
               compact
               style={[styles.activeChip, { backgroundColor: chipColors.activeBackground }]}
               textStyle={[styles.chipText, { color: chipColors.activeForeground }]}
            >
               {workoutPlan.durationWeeks
                  ? `${workoutPlan.durationWeeks} semanas`
                  : 'Duracion'}
            </Chip>
         </View>
         <View>
            <Button
               mode="contained"
               onPress={handleStartRoutine}
               labelStyle={styles.buttonLabel}
               style={styles.button}
               contentStyle={styles.buttonContent}
            >
               Empezar rutina
            </Button>
         </View>
      </View>
   )
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   hero: {
      gap: 14,
   },
   eyebrow: {
      color: VIEW_COLORS.muted,
      fontWeight: '800',
      textTransform: 'uppercase',
   },
   title: {
      color: theme.colors.onBackground,
      fontWeight: '900',
   },
   description: {
      color: VIEW_COLORS.muted,
      lineHeight: 20,
   },
   chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   chip: {
      borderWidth: 1,
   },
   activeChip: {
      borderWidth: 0,
   },
   chipText: {
      fontWeight: '800',
   },
   button: {
      marginTop: 20,
      borderRadius: 12,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 34,
   },
   buttonLabel: {
      fontSize: 16,
   },
});
