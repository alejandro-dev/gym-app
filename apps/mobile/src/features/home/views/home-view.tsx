import type { WorkoutSessionFeedItem } from '@gym-app/types';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';

import { useProfileQuery } from '@/features/profile/queries/use-profile-query';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import WorkoutFeedCard from '../components/workout-feed-card';
import { useCompletedWorkoutSessionsQuery } from '../queries/use-workout-session-query';
import { formatCompactVolume, formatDurationSummary } from '../utils/utils';

type HomeViewProps = {
   onOpenWorkoutOptions: (workoutSession: WorkoutSessionFeedItem) => void;
};

export default function HomeView({ onOpenWorkoutOptions }: HomeViewProps) {
   const { data, isLoading, isError } = useCompletedWorkoutSessionsQuery({
      page: 0,
      limit: 10,
   });
   const { data: profile } = useProfileQuery();

   const feedItems = data?.items ?? [];

   // Calculamos el tiempo total de las rutinas
   const totalDurationSeconds = feedItems.reduce(
      (accumulator, item) => accumulator + item.durationSeconds,
      0,
   );

   // Calculamos el volumen total de las rutinas
   const totalVolumeKg = feedItems.reduce(
      (accumulator, item) => accumulator + item.volumeKg,
      0,
   );

   // Calculamos el número total de series de las rutinas
   const totalSets = feedItems.reduce(
      (accumulator, item) =>
         accumulator +
         item.exercises.reduce(
            (sessionAccumulator, exercise) => sessionAccumulator + exercise.completedSets.length,
            0,
         ),
      0,
   );

   // Obtenemos el primer carácter del nombre de usuario
   const avatarLetter = profile?.username?.at(0)?.toUpperCase() ?? 'A';

   return (
      <ScrollView
         contentContainerStyle={styles.content}
         showsVerticalScrollIndicator={false}
      >
         <View style={styles.header}>
            <View style={styles.headerCopy}>
               <Text style={styles.eyebrow}>SESIONES</Text>
               <Text style={styles.title}>Inicio</Text>
            </View>

            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
         </View>

         <View style={styles.summaryCard}>
            <SummaryStat label="tiempo" value={formatDurationSummary(totalDurationSeconds)} />
            <SummaryStat label="kg movidos" value={formatCompactVolume(totalVolumeKg)} />
            <SummaryStat label="series" value={String(totalSets)} valueAccent />
         </View>

         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas sesiones</Text>
            <View style={styles.countChip}>
               <Text style={styles.countChipText}>{feedItems.length}</Text>
            </View>
         </View>

         {isLoading ? (
            <Text style={styles.stateText}>Cargando sesiones...</Text>
         ) : isError ? (
            <Text style={styles.stateText}>No se pudieron cargar las sesiones.</Text>
         ) : feedItems.length === 0 ? (
            <View style={styles.emptyCard}>
               <Text style={styles.emptyTitle}>Todavía no tienes sesiones realizadas</Text>
               <Text style={styles.emptyText}>
                  Cuando completes tu primer entreno, aparecerá aquí con su resumen.
               </Text>
            </View>
         ) : (
            <View style={styles.feedList}>
               {feedItems.map((item, index) => (
                  <WorkoutFeedCard
                     key={item.id}
                     item={item}
                     isCompact={index > 0}
                     onOpenOptions={onOpenWorkoutOptions}
                  />
               ))}
            </View>
         )}
      </ScrollView>
   );
}

function SummaryStat({
   label,
   value,
   valueAccent = false,
}: {
   label: string;
   value: string;
   valueAccent?: boolean;
}) {
   return (
      <View style={styles.summaryStat}>
         <Text style={[styles.summaryValue, valueAccent && styles.summaryValueAccent]}>{value}</Text>
         <Text style={styles.summaryLabel}>{label}</Text>
      </View>
   );
}

const styles = StyleSheet.create({
   avatar: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 22,
      height: 44,
      justifyContent: 'center',
      width: 44,
   },
   avatarText: {
      color: AUTH_COLORS.primaryForeground,
      fontSize: 18,
      fontWeight: '800',
   },
   content: {
      gap: 12,
      paddingBottom: 28,
      paddingTop: 12,
   },
   countChip: {
      backgroundColor: AUTH_COLORS.helpSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
   },
   countChipText: {
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
   feedList: {
      gap: 10,
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
   },
   headerCopy: {
      gap: 2,
      flex: 1,
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
   stateText: {
      color: VIEW_COLORS.muted,
      paddingVertical: 12,
   },
   summaryCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 8,
      padding: 12,
   },
   summaryLabel: {
      color: '#9EA3AD',
      fontSize: 11,
   },
   summaryStat: {
      flex: 1,
      gap: 3,
   },
   summaryValue: {
      color: VIEW_COLORS.onDark,
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '800',
   },
   summaryValueAccent: {
      color: AUTH_COLORS.primary,
   },
   title: {
      color: VIEW_COLORS.onDark,
      fontSize: 26,
      fontWeight: '800',
   },
});
