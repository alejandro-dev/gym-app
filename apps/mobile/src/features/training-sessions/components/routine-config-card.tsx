import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import type { WorkoutPlanGoal, WorkoutPlanLevel } from '@gym-app/types';
import {
   getWorkoutPlanGoalLabelEs,
   getWorkoutPlanLevelLabelEs,
} from '@gym-app/types';

interface RoutineConfigCardProps {
   // Los valores son enums de API; los labels se resuelven solo al pintar.
   goals: readonly WorkoutPlanGoal[];
   levels: readonly WorkoutPlanLevel[];
   selectedGoal: WorkoutPlanGoal;
   selectedLevel: WorkoutPlanLevel;
   status: string;
   onGoalChange: (goal: WorkoutPlanGoal) => void;
   onLevelChange: (level: WorkoutPlanLevel) => void;
   onStatusChange: (status: string) => void;
}

// Componente para configurar los detalles de la rutina como el objetivo, el nivel y el estado.
const RoutineConfigCard = ({
   goals,
   levels,
   selectedGoal,
   selectedLevel,
   status,
   onGoalChange,
   onLevelChange,
   onStatusChange,
}: RoutineConfigCardProps) => {
   const theme = useTheme();

   return(
      <Card mode="contained" style={styles.card}>
         <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
               Configuración
            </Text>

            <View style={styles.fieldGroup}>
               <Text variant="labelLarge" style={styles.fieldLabel}>
                  Objetivo
               </Text>
               <View style={styles.chipRow}>
                  {goals.map((goal) => (
                     <Chip
                        key={goal}
                        selected={selectedGoal === goal}
                        onPress={() => onGoalChange(goal)}
                        style={[
                           styles.chip,
                           selectedGoal === goal && {
                              backgroundColor: theme.colors.primary,
                           },
                        ]}
                        textStyle={styles.chipText}
                        selectedColor={theme.colors.onSurface}
                        showSelectedOverlay
                     >
                        {getWorkoutPlanGoalLabelEs(goal)}
                     </Chip>
                  ))}
               </View>
            </View>

            <View style={styles.fieldGroup}>
               <Text variant="labelLarge" style={styles.fieldLabel}>
                  Nivel
               </Text>
               <View style={styles.chipRow}>
                  {levels.map((level) => (
                     <Chip
                        key={level}
                        selected={selectedLevel === level}
                        onPress={() => onLevelChange(level)}
                        style={[
                           styles.chip,
                           selectedLevel === level && {
                              backgroundColor: theme.colors.primary,
                           },
                        ]}
                        textStyle={styles.chipText}
                        selectedColor={theme.colors.onSurface}
                        showSelectedOverlay
                     >
                        {getWorkoutPlanLevelLabelEs(level)}
                     </Chip>
                  ))}
               </View>
            </View>

            <View style={styles.fieldGroup}>
               <Text variant="labelLarge" style={styles.fieldLabel}>
                  Estado
               </Text>
               <SegmentedButtons
                  value={status}
                  onValueChange={onStatusChange}
                  buttons={[
                     {
                        value: 'active',
                        label: 'Activo',
                        checkedColor: theme.colors.onSurface,
                        uncheckedColor: theme.colors.onSurface,
                        style: {
                           backgroundColor: status === 'active' ? theme.colors.primary : '#1c1c1c',
                           borderColor: status === 'active' ? theme.colors.primary : '#1c1c1c',
                        },
                     },
                     {
                        value: 'draft',
                        label: 'Borrador',
                        checkedColor: theme.colors.onSurface,
                        uncheckedColor: theme.colors.onSurface,
                        style: {
                           backgroundColor: status === 'draft' ? theme.colors.primary : '#1c1c1c',
                           borderColor: status === 'draft' ? theme.colors.primary : '#1c1c1c',
                        },
                     },
                  ]}
                  style={styles.segmented}
               />
            </View>
         </Card.Content>
      </Card>
   )
};

export default memo(RoutineConfigCard);

const styles = StyleSheet.create({
   card: {
      borderRadius: 26,
      borderCurve: 'continuous',
   },
   cardContent: {
      gap: 16,
      paddingVertical: 18,
   },
   sectionTitle: {
      fontWeight: '800',
   },
   fieldGroup: {
      gap: 10,
   },
   fieldLabel: {
      fontWeight: '700',
   },
   chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   chip: {
      borderRadius: 999,
      backgroundColor: '#1c1c1c',
   },
   chipText: {
      color: '#fff',
   },
   segmented: {
      borderRadius: 18,
   },
});
