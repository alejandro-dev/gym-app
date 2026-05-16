import type { Exercise } from '@gym-app/types';
import {
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { resolveApiImageUrl } from '@/services/api/media';
import { useNewRoutine } from '@/features/training-sessions/context/new-routine-context';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

export type ExerciseTab = 'summary' | 'history' | 'instructions';

type ExerciseDetailViewProps = {
   exercise: Exercise;
   selectedTab: ExerciseTab;
   setSelectedTab: (tab: ExerciseTab) => void;
};

const TABS: { value: ExerciseTab; label: string }[] = [
   { value: 'summary', label: 'Resumen' },
   { value: 'history', label: 'Historia' },
   { value: 'instructions', label: 'Indicaciones' },
];

export default function ExerciseDetailView({
   exercise,
   selectedTab,
   setSelectedTab,
}: ExerciseDetailViewProps) {
   const { setSelectedRoutineExercise } = useNewRoutine();

   const instructionSteps = useMemo(() => {
      const instructions = exercise.instructions?.trim();
      if (!instructions) return [];

      return instructions
         .split(/\n+|(?:\.\s+)/)
         .map((step) => step.trim().replace(/\.$/, ''))
         .filter(Boolean);
   }, [exercise.instructions]);

   const handleAddToRoutine = () => {
      setSelectedRoutineExercise({
         id: exercise.id,
         name: exercise.name,
         imageUrl: exercise.imageUrl,
         muscleGroup: exercise.muscleGroup,
         category: exercise.category,
         equipment: exercise.equipment,
         isCompound: exercise.isCompound,
      });

      router.navigate('/training-sessions/new-exercise');
   };

   const visibleSteps =
      instructionSteps.length > 0
         ? instructionSteps
         : ['Mantén una técnica controlada durante todo el movimiento.'];
   const imageUri = resolveApiImageUrl(exercise.imageUrl);

   return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
         <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
               <MaterialDesignIcons color={VIEW_COLORS.onDark} name="arrow-left" size={20} />
            </Pressable>

            <Text style={styles.headerTitle}>Detalle ejercicio</Text>
         </View>

         <View style={styles.hero}>
            {imageUri ? (
               <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="contain" />
            ) : (
               <Text style={styles.heroText}>{exercise.name.slice(0, 2).toUpperCase()}</Text>
            )}
         </View>

         <View style={styles.titleBlock}>
            <Text style={styles.title}>{exercise.name}</Text>
            <View style={styles.tagRow}>
               <Tag label={getMuscleGroupLabelEs(exercise.muscleGroup)} accent />
               <Tag label={getExerciseCategoryLabelEs(exercise.category)} />
               <Tag label={exercise.isCompound ? 'Compuesto' : 'Aislado'} />
            </View>
         </View>

         <View style={styles.tabBar}>
            {TABS.map((tab) => {
               const isSelected = selectedTab === tab.value;

               return (
                  <Pressable
                     key={tab.value}
                     onPress={() => setSelectedTab(tab.value)}
                     style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                  >
                     <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                        {tab.label}
                     </Text>
                  </Pressable>
               );
            })}
         </View>

         {selectedTab === 'summary' ? (
            <View style={styles.sectionCard}>
               <Text style={styles.sectionTitle}>Resumen</Text>
               <Text style={styles.description}>
                  {exercise.description?.trim() ||
                     'Movimiento principal orientado a desarrollar fuerza y control técnico.'}
               </Text>

               <View style={styles.infoGrid}>
                  <InfoCell label="Equipo" value={exercise.equipment ?? 'Barra'} />
                  <InfoCell
                     label="Video"
                     value={exercise.videoUrl ? 'Disponible' : 'Sin video'}
                     accent={Boolean(exercise.videoUrl)}
                  />
               </View>

               <View style={styles.notePanel}>
                  <Text style={styles.noteTitle}>Indicaciones</Text>
                  <Text style={styles.noteText}>
                     {visibleSteps.slice(0, 2).map((step, index) => `${index + 1}. ${step}`).join('\n')}
                  </Text>
               </View>
            </View>
         ) : null}

         {selectedTab === 'history' ? (
            <View style={styles.sectionCard}>
               <Text style={styles.sectionTitle}>Historia</Text>
               <View style={styles.emptyHistory}>
                  <MaterialDesignIcons color="#6F7682" name="chart-bar" size={28} />
                  <Text style={styles.emptyHistoryText}>Todavía no hay sesiones registradas.</Text>
               </View>
            </View>
         ) : null}

         {selectedTab === 'instructions' ? (
            <View style={styles.sectionCard}>
               <Text style={styles.sectionTitle}>Indicaciones</Text>
               <View style={styles.stepList}>
                  {visibleSteps.map((step, index) => (
                     <View key={`${step}-${index}`} style={styles.stepRow}>
                        <View style={styles.stepBadge}>
                           <Text style={styles.stepBadgeText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                     </View>
                  ))}
               </View>

               {exercise.videoUrl ? (
                  <Button
                     mode="outlined"
                     onPress={() => Linking.openURL(exercise.videoUrl!)}
                     style={styles.secondaryButton}
                     labelStyle={styles.secondaryButtonLabel}
                  >
                     Ver video
                  </Button>
               ) : null}
            </View>
         ) : null}

         <Button
            mode="contained"
            icon="plus"
            onPress={handleAddToRoutine}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            labelStyle={styles.ctaButtonLabel}
         >
            Añadir a la rutina
         </Button>
      </ScrollView>
   );
}

function Tag({ label, accent = false }: { label: string; accent?: boolean }) {
   return (
      <View style={[styles.tag, accent && styles.tagAccent]}>
         <Text style={[styles.tagText, accent && styles.tagTextAccent]}>{label}</Text>
      </View>
   );
}

function InfoCell({
   label,
   value,
   accent = false,
}: {
   label: string;
   value: string;
   accent?: boolean;
}) {
   return (
      <View style={styles.infoCell}>
         <Text style={styles.infoLabel}>{label}</Text>
         <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>{value}</Text>
      </View>
   );
}

const styles = StyleSheet.create({
   content: {
      gap: 12,
      paddingBottom: 32,
      paddingTop: 12,
   },
   ctaButton: {
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 16,
      marginTop: 4,
   },
   ctaButtonContent: {
      minHeight: 52,
   },
   ctaButtonLabel: {
      color: AUTH_COLORS.primaryForeground,
      fontSize: 14,
      fontWeight: '900',
   },
   description: {
      color: '#9EA3AD',
      fontSize: 12,
      lineHeight: 18,
   },
   emptyHistory: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      gap: 8,
      justifyContent: 'center',
      minHeight: 110,
      padding: 16,
   },
   emptyHistoryText: {
      color: '#6F7682',
      fontSize: 12,
      textAlign: 'center',
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      height: 48,
   },
   headerTitle: {
      color: '#FFFFFF',
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
   },
   hero: {
      alignItems: 'center',
      backgroundColor: '#E7E6E0',
      borderRadius: 14,
      height: 120,
      justifyContent: 'center',
      overflow: 'hidden',
      padding: 8,
   },
   heroImage: {
      height: '100%',
      width: '100%',
   },
   heroText: {
      color: '#737373',
      fontFamily: 'monospace',
      fontSize: 42,
      fontWeight: '900',
   },
   iconButton: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
   },
   infoCell: {
      flex: 1,
      gap: 2,
   },
   infoGrid: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 12,
   },
   infoLabel: {
      color: '#6F7682',
      fontSize: 10,
   },
   infoValue: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
   },
   infoValueAccent: {
      color: AUTH_COLORS.primary,
   },
   notePanel: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
      padding: 12,
   },
   noteText: {
      color: '#9EA3AD',
      fontSize: 11,
      lineHeight: 17,
   },
   noteTitle: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
   },
   sectionCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 14,
   },
   sectionTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   secondaryButton: {
      borderColor: '#34303A',
      borderRadius: 14,
   },
   secondaryButtonLabel: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
   },
   stepBadge: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 10,
      height: 22,
      justifyContent: 'center',
      width: 22,
   },
   stepBadgeText: {
      color: AUTH_COLORS.primaryForeground,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '900',
   },
   stepList: {
      gap: 10,
   },
   stepRow: {
      flexDirection: 'row',
      gap: 10,
   },
   stepText: {
      color: '#B8BCC6',
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
   },
   tabBar: {
      flexDirection: 'row',
      gap: 6,
   },
   tabButton: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 999,
      flex: 1,
      justifyContent: 'center',
      minHeight: 32,
      paddingHorizontal: 8,
   },
   tabButtonActive: {
      backgroundColor: AUTH_COLORS.primary,
   },
   tabText: {
      color: '#9EA3AD',
      fontSize: 10,
      fontWeight: '800',
   },
   tabTextActive: {
      color: AUTH_COLORS.primaryForeground,
   },
   tag: {
      backgroundColor: '#211F26',
      borderColor: '#34303A',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 5,
   },
   tagAccent: {
      backgroundColor: '#261B11',
      borderColor: '#3D2A18',
   },
   tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
   },
   tagText: {
      color: '#B8BCC6',
      fontSize: 10,
      fontWeight: '700',
   },
   tagTextAccent: {
      color: AUTH_COLORS.primary,
   },
   title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
   },
   titleBlock: {
      gap: 8,
   },
});
