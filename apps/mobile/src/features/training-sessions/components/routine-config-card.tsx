import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, SegmentedButtons, Text } from 'react-native-paper';

interface RoutineConfigCardProps {
   goals: string[];
   levels: string[];
   selectedGoal: string;
   selectedLevel: string;
   status: string;
   onGoalChange: (goal: string) => void;
   onLevelChange: (level: string) => void;
   onStatusChange: (status: string) => void;
}

const RoutineConfigCard = ({
   goals,
   levels,
   selectedGoal,
   selectedLevel,
   status,
   onGoalChange,
   onLevelChange,
   onStatusChange,
}: RoutineConfigCardProps) => (
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
                     style={styles.chip}
                     showSelectedOverlay
                  >
                     {goal}
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
                     style={styles.chip}
                     showSelectedOverlay
                  >
                     {level}
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
                  { value: 'active', label: 'Activo' },
                  { value: 'draft', label: 'Borrador' },
               ]}
               style={styles.segmented}
            />
         </View>
      </Card.Content>
   </Card>
);

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
   },
   segmented: {
      borderRadius: 18,
   },
});
