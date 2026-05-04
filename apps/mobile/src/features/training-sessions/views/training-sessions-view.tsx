import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, List, Text, useTheme } from 'react-native-paper';
import type { WorkoutPlan } from '@gym-app/types';

import { VIEW_COLORS } from '@/theme/colors';
import { WorkoutPlanCard } from '../components/workout-plan-card';
import { useTrainingSessionsView } from '../hooks/use-training-sessions-view';

interface TrainingSessionsViewProps {
   onOpenWorkoutOptions: (workoutPlan: WorkoutPlan) => void;
}

const TrainingSessionsView = ({
   onOpenWorkoutOptions,
}: TrainingSessionsViewProps) => {
   const { expanded, isLoading, isError, workoutPlans, setExpanded } = useTrainingSessionsView();

   const theme = useTheme();

   return (
      <View style={styles.container}>
         <List.Section title="Rutinas" titleStyle={styles.sectionTitle}>
            <Button
               mode="contained"
               onPress={() => router.navigate('/training-sessions/new')}
               contentStyle={[
                  styles.buttonContent,
                  { backgroundColor: theme.colors.primary },
               ]}
               labelStyle={styles.buttonLabel}
               style={styles.button}
            >
               Nueva rutina
            </Button>

            <List.Accordion
               expanded={expanded}
               onPress={() => setExpanded((current) => !current)}
               title={`Mis rutinas (${workoutPlans?.length ?? 0})`}
               style={styles.accordion}
               contentStyle={styles.accordionContent}
               titleStyle={[styles.accordionTitle, { color: VIEW_COLORS.muted }]}
               rippleColor="transparent"
            >
               {isLoading ? (
                  <Text style={styles.stateText}>Cargando rutinas...</Text>
               ) : isError ? (
                  <Text style={styles.stateText}>No se pudieron cargar las rutinas.</Text>
               ) : workoutPlans.length === 0 ? (
                  <Text style={styles.stateText}>Todavía no tienes rutinas.</Text>
               ) : (
                  <View style={styles.list}>
                     {workoutPlans.map((workoutPlan) => (
                        <WorkoutPlanCard
                           key={workoutPlan.id}
                           workoutPlan={workoutPlan}
                           onOpenOptions={onOpenWorkoutOptions}
                        />
                     ))}
                  </View>
               )}
            </List.Accordion>
         </List.Section>
      </View>
   );
};

export default memo(TrainingSessionsView);

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   button: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 54,
   },
   buttonLabel: {
      fontSize: 16,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: VIEW_COLORS.onDark,
      paddingLeft: 0,
   },
   accordion: {
      paddingLeft: 0,
      marginLeft: 0,
   },
   accordionContent: {
      paddingLeft: 0,
      marginLeft: 0,
   },
   accordionTitle: {
      fontSize: 16,
      marginLeft: 0,
   },
   list: {
      gap: 12,
   },
   stateText: {
      color: VIEW_COLORS.muted,
      paddingVertical: 12,
   },
});
