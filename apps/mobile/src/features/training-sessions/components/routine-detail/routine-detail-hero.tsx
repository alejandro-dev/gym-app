import type { WorkoutPlan, WorkoutPlanExercise } from '@gym-app/types';
import { getWorkoutPlanGoalLabelEs, getWorkoutPlanLevelLabelEs } from '@gym-app/types';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

type RoutineDetailHeroProps = {
   workoutPlan: WorkoutPlan;
   exercises: WorkoutPlanExercise[];
};

export default function RoutineDetailHero({
   workoutPlan,
   exercises,
}: RoutineDetailHeroProps) {
   const badgeParts = [
      workoutPlan.goal ? getWorkoutPlanGoalLabelEs(workoutPlan.goal).toUpperCase() : null,
      workoutPlan.level ? getWorkoutPlanLevelLabelEs(workoutPlan.level).toUpperCase() : null,
   ].filter(Boolean);

   const stats = [
      {
         label: 'ejercicios',
         value: String(exercises.length),
      },
      {
         accent: workoutPlan.isActive,
         label: 'estado',
         value: workoutPlan.isActive ? 'Activa' : 'Pausada',
      },
   ];

   return (
      <View style={styles.hero}>
         <View style={styles.titleBlock}>
            <View style={styles.badge}>
               <Text style={styles.badgeText}>
                  {badgeParts.length > 0 ? badgeParts.join(' · ') : 'RUTINA'}
               </Text>
            </View>

            <Text style={styles.title}>{workoutPlan.name}</Text>
         </View>

         <Text style={styles.description}>
            {workoutPlan.description?.trim() ||
               'Plan sin descripción. Revisa abajo sus ejercicios y configuración.'}
         </Text>

         <View style={styles.statsRow}>
            {stats.map((stat) => (
               <View
                  key={stat.label}
                  style={[styles.statCard, stat.accent && styles.statCardAccent]}
               >
                  <Text style={[styles.statValue, stat.accent && styles.statValueAccent]}>
                     {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, stat.accent && styles.statLabelAccent]}>
                     {stat.label}
                  </Text>
               </View>
            ))}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   badge: {
      alignSelf: 'flex-start',
      backgroundColor: AUTH_COLORS.helpSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
   },
   badgeText: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '800',
   },
   description: {
      color: '#B8BCC6',
      fontSize: 13,
      lineHeight: 18,
   },
   hero: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 20,
      borderWidth: 1,
      gap: 12,
      padding: 16,
   },
   statCard: {
      backgroundColor: '#211F26',
      borderRadius: 12,
      flex: 1,
      gap: 2,
      padding: 10,
   },
   statCardAccent: {
      backgroundColor: AUTH_COLORS.helpSurface,
   },
   statLabel: {
      color: '#9EA3AD',
      fontSize: 10,
   },
   statLabelAccent: {
      color: '#B8BCC6',
   },
   statValue: {
      color: VIEW_COLORS.onDark,
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '800',
   },
   statValueAccent: {
      color: AUTH_COLORS.primary,
   },
   statsRow: {
      flexDirection: 'row',
      gap: 8,
   },
   title: {
      color: VIEW_COLORS.onDark,
      fontSize: 28,
      fontWeight: '900',
   },
   titleBlock: {
      gap: 4,
   },
});
