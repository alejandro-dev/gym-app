import type { WorkoutPlan } from '@gym-app/types';
import { router } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import { WorkoutPlanCard } from '../components/workout-plan-card';
import { useTrainingSessionsView } from '../hooks/use-training-sessions-view';

interface TrainingSessionsViewProps {
   onOpenWorkoutInfo: (workoutPlan: WorkoutPlan) => void;
   onOpenWorkoutOptions: (workoutPlan: WorkoutPlan) => void;
}

type RoutineFilter = 'active' | 'all' | 'templates';

const FILTER_OPTIONS: { key: RoutineFilter; label: string }[] = [
   { key: 'active', label: 'Activas' },
   { key: 'all', label: 'Todas' },
   { key: 'templates', label: 'Plantillas' },
];

const TrainingSessionsView = ({
   onOpenWorkoutInfo,
   onOpenWorkoutOptions,
}: TrainingSessionsViewProps) => {
   const { isLoading, isError, workoutPlans } = useTrainingSessionsView();
   const [selectedFilter, setSelectedFilter] = useState<RoutineFilter>('active');

   const filteredWorkoutPlans = useMemo(() => {
      if (selectedFilter === 'templates') {
         return [] as WorkoutPlan[];
      }

      if (selectedFilter === 'active') {
         return workoutPlans.filter((workoutPlan) => workoutPlan.isActive);
      }

      return workoutPlans;
   }, [selectedFilter, workoutPlans]);

   const activeCount = workoutPlans.filter((workoutPlan) => workoutPlan.isActive).length;
   const listTitle =
      selectedFilter === 'templates' ? 'Plantillas' : 'Mis rutinas';

   return (
      <ScrollView
         contentContainerStyle={styles.content}
         showsVerticalScrollIndicator={false}
      >
         <View style={styles.header}>
            <View style={styles.headerCopy}>
               <Text style={styles.eyebrow}>WORKOUT PLANS</Text>
               <Text style={styles.title}>Rutinas</Text>
            </View>

            <Pressable
               accessibilityRole="button"
               onPress={() => router.navigate('/training-sessions/new')}
               style={styles.addButton}
            >
               <Text style={styles.addButtonText}>+</Text>
            </Pressable>
         </View>

         <View style={styles.segmentedControl}>
            {FILTER_OPTIONS.map((option) => {
               const isSelected = selectedFilter === option.key;

               return (
                  <Pressable
                     key={option.key}
                     onPress={() => setSelectedFilter(option.key)}
                     style={[styles.segmentItem, isSelected && styles.segmentItemActive]}
                  >
                     <Text
                        style={[
                           styles.segmentLabel,
                           isSelected && styles.segmentLabelActive,
                        ]}
                     >
                        {option.label}
                     </Text>
                  </Pressable>
               );
            })}
         </View>

         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{listTitle}</Text>
            <View style={styles.countBadge}>
               <Text style={styles.countBadgeText}>
                  {selectedFilter === 'active' ? activeCount : filteredWorkoutPlans.length}
               </Text>
            </View>
         </View>

         {isLoading ? (
            <Text style={styles.stateText}>Cargando rutinas...</Text>
         ) : isError ? (
            <Text style={styles.stateText}>No se pudieron cargar las rutinas.</Text>
         ) : filteredWorkoutPlans.length === 0 ? (
            <View style={styles.emptyCard}>
               <Text style={styles.emptyTitle}>
                  {selectedFilter === 'templates'
                     ? 'Todavía no hay plantillas disponibles'
                     : 'Todavía no tienes rutinas'}
               </Text>
               <Text style={styles.emptyText}>
                  {selectedFilter === 'templates'
                     ? 'Cuando existan plantillas en el sistema, aparecerán aquí.'
                     : 'Crea una nueva rutina para empezar a organizar tus entrenamientos.'}
               </Text>
            </View>
         ) : (
            <View style={styles.list}>
               {filteredWorkoutPlans.map((workoutPlan, index) => (
                  <WorkoutPlanCard
                     key={workoutPlan.id}
                     workoutPlan={workoutPlan}
                     isCompact={index > 0}
                     onOpenInfo={onOpenWorkoutInfo}
                     onOpenOptions={onOpenWorkoutOptions}
                  />
               ))}
            </View>
         )}
      </ScrollView>
   );
};

export default memo(TrainingSessionsView);

const styles = StyleSheet.create({
   addButton: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 16,
      height: 44,
      justifyContent: 'center',
      width: 44,
   },
   addButtonText: {
      color: AUTH_COLORS.primaryForeground,
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 26,
   },
   content: {
      gap: 12,
      paddingBottom: 28,
      paddingTop: 12,
   },
   countBadge: {
      backgroundColor: '#211F26',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
   },
   countBadgeText: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: '800',
   },
   emptyCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 6,
      padding: 16,
   },
   emptyText: {
      color: VIEW_COLORS.muted,
      fontSize: 13,
      lineHeight: 18,
   },
   emptyTitle: {
      color: VIEW_COLORS.onDark,
      fontSize: 16,
      fontWeight: '800',
   },
   eyebrow: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
   },
   headerCopy: {
      flex: 1,
      gap: 2,
   },
   list: {
      gap: 10,
   },
   sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
   },
   sectionTitle: {
      color: VIEW_COLORS.onDark,
      fontSize: 18,
      fontWeight: '800',
   },
   segmentItem: {
      alignItems: 'center',
      borderRadius: 18,
      flex: 1,
      justifyContent: 'center',
   },
   segmentItemActive: {
      backgroundColor: AUTH_COLORS.primary,
   },
   segmentedControl: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 22,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 4,
      height: 42,
      padding: 4,
   },
   segmentLabel: {
      color: '#9EA3AD',
      fontSize: 12,
      fontWeight: '700',
   },
   segmentLabelActive: {
      color: AUTH_COLORS.primaryForeground,
      fontWeight: '800',
   },
   stateText: {
      color: VIEW_COLORS.muted,
      paddingVertical: 12,
   },
   title: {
      color: VIEW_COLORS.onDark,
      fontSize: 26,
      fontWeight: '800',
   },
});
