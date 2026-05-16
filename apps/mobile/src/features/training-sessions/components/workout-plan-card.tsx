import type { WorkoutPlan } from '@gym-app/types';
import {
   getWorkoutPlanGoalLabelEs,
   getWorkoutPlanLevelLabelEs,
} from '@gym-app/types';
import { router } from 'expo-router';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

type WorkoutPlanCardProps = {
   workoutPlan: WorkoutPlan;
   onOpenInfo: (workoutPlan: WorkoutPlan) => void;
   onOpenOptions: (workoutPlan: WorkoutPlan) => void;
   isCompact?: boolean;
};

// Componente para mostrar una rutina en una lista de rutinas.
export function WorkoutPlanCard({
   workoutPlan,
   onOpenInfo,
   onOpenOptions,
   isCompact = false,
}: WorkoutPlanCardProps) {
   // Evento para iniciar la rutina seleccionada.
   const handleStartRoutine = (workoutPlanId: string) => {
      router.push({
         pathname: '/(protected)/training-sessions/[id]/start',
         params: {
            id: workoutPlanId,
         },
      });
   };

   const metaParts = [
      workoutPlan.goal ? getWorkoutPlanGoalLabelEs(workoutPlan.goal).toUpperCase() : null,
      workoutPlan.level ? getWorkoutPlanLevelLabelEs(workoutPlan.level).toUpperCase() : null,
      workoutPlan.exercises?.length ? `${workoutPlan.exercises.length} ejercicios` : null,
   ].filter(Boolean);

   const detailTiles = [
      {
         label: 'ejercicios',
         value: String(workoutPlan.exercises?.length ?? 0),
         accent: false,
      },
      {
         label: 'estado',
         value: workoutPlan.isActive ? 'Activa' : 'Pausada',
         accent: workoutPlan.isActive,
      },
   ];

   const handleOpenOptions = (event?: GestureResponderEvent) => {
      event?.stopPropagation();
      onOpenOptions(workoutPlan);
   };

   if (isCompact) {
      return (
         <Pressable
            onLongPress={() => onOpenOptions(workoutPlan)}
            onPress={() => onOpenInfo(workoutPlan)}
            style={styles.compactCard}
         >
            <View style={styles.titleRow}>
               <Text style={styles.compactTitle}>{workoutPlan.name}</Text>
               <Pressable
                  accessibilityLabel="Opciones"
                  hitSlop={8}
                  onPress={handleOpenOptions}
                  style={styles.moreButton}
               >
                  <MaterialDesignIcons color="#9EA3AD" name="dots-horizontal" size={22} />
               </Pressable>
            </View>
            <Text style={styles.compactMeta}>
               {metaParts.length > 0 ? metaParts.join(' · ') : 'Sin configuración adicional'}
            </Text>
         </Pressable>
      );
   }

   return (
      <Pressable
         onLongPress={() => onOpenOptions(workoutPlan)}
         onPress={() => onOpenInfo(workoutPlan)}
         style={styles.card}
      >
         <View style={styles.titleBlock}>
            <View style={styles.badge}>
               <Text style={styles.metaLine}>
                  {metaParts.length > 0 ? metaParts.join(' · ') : 'RUTINA'}
               </Text>
            </View>
            <Text style={styles.title}>{workoutPlan.name}</Text>
         </View>

         <Text style={styles.description}>
            {workoutPlan.description?.trim() ||
               'Plan sin descripción. Ábrelo para revisar ejercicios y configuración.'}
         </Text>

         <View style={styles.fieldsRow}>
            {detailTiles.map((tile) => (
               <View
                  key={tile.label}
                  style={[styles.fieldTile, tile.accent && styles.fieldTileAccent]}
               >
                  <Text style={[styles.fieldValue, tile.accent && styles.fieldValueAccent]}>
                     {tile.value}
                  </Text>
                  <Text style={styles.fieldLabel}>{tile.label}</Text>
               </View>
            ))}
         </View>

         <Pressable
            accessibilityLabel="Empezar rutina"
            onPress={() => handleStartRoutine(workoutPlan.id)}
            style={styles.startButton}
         >
            <Text style={styles.startButtonText}>Empezar rutina</Text>
            <MaterialDesignIcons
               color={AUTH_COLORS.primaryForeground}
               name="play"
               size={18}
            />
         </Pressable>
      </Pressable>
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
   card: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 14,
   },
   compactCard: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 18,
      borderWidth: 1,
      gap: 8,
      padding: 14,
   },
   compactMeta: {
      color: '#9EA3AD',
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '700',
      lineHeight: 16,
      textTransform: 'uppercase',
   },
   compactTitle: {
      color: VIEW_COLORS.onDark,
      fontSize: 16,
      fontWeight: '800',
   },
   description: {
      color: '#B8BCC6',
      fontSize: 12,
      lineHeight: 18,
   },
   fieldLabel: {
      color: '#9EA3AD',
      fontSize: 11,
   },
   fieldTile: {
      backgroundColor: '#211F26',
      borderRadius: 12,
      flex: 1,
      gap: 2,
      padding: 10,
   },
   fieldTileAccent: {
      backgroundColor: AUTH_COLORS.helpSurface,
   },
   fieldsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
   },
   fieldValue: {
      color: VIEW_COLORS.onDark,
      fontSize: 15,
      fontWeight: '800',
   },
   fieldValueAccent: {
      color: AUTH_COLORS.primary,
   },
   metaLine: {
      color: '#9EA3AD',
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '700',
      lineHeight: 16,
      textTransform: 'uppercase',
   },
   moreButton: {
      alignItems: 'center',
      height: 22,
      justifyContent: 'center',
      width: 22,
   },
   startButton: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 14,
      flexDirection: 'row',
      gap: 8,
      height: 44,
      justifyContent: 'center',
   },
   startButtonText: {
      color: AUTH_COLORS.primaryForeground,
      fontSize: 14,
      fontWeight: '800',
   },
   title: {
      color: VIEW_COLORS.onDark,
      fontSize: 18,
      fontWeight: '800',
   },
   titleBlock: {
      gap: 6,
   },
   titleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
   },
});
