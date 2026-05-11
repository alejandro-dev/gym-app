import { useMemo, useState, type ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
   ActivityIndicator,
   Text,
   useTheme,
   type MD3Theme,
} from 'react-native-paper';
import { VIEW_COLORS } from '@/theme/colors';
import { useExerciseQuery } from '../../exercises/queries/use-exercise-query';
import ExerciseDetailHero from '../components/exercise-detail-hero';
import ExerciseDetailTabs from '../components/exercise-detail-tabs';
import ExerciseSummaryTab from '../components/exercise-summary-tab';
import ExerciseDetailHeader from '../components/exercise-detail-header';
import ExerciseHistoryTab from '../components/exercise-history-tab';
import ExerciseInstructionsTab from '../components/exercise-instructions-tab';
import { Exercise } from '@gym-app/types';
import { QueryObserverResult } from '@tanstack/react-query';

export type ExerciseTab = 'summary' | 'history' | 'instructions';

type ExerciseDetailViewProps = {
   exercise: Exercise;
   selectedTab: ExerciseTab;
};

export default function ExerciseDetailView({ exercise, selectedTab }: ExerciseDetailViewProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   // Obtenemos las instrucciones del ejercicio.
   const instructionSteps = useMemo(() => {
      const instructions = exercise?.instructions?.trim();
      if (!instructions) return [];

      return instructions
         .split(/\n+|(?:\.\s+)/)
         .map((step) => step.trim().replace(/\.$/, ''))
         .filter(Boolean);
   }, [exercise?.instructions]);

   

   return (
      <ScrollView
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.content}
      >         

         <ExerciseDetailHeader exercise={exercise} />

         {selectedTab === 'summary' ? (
            <ExerciseSummaryTab
               category={exercise.category}
               description={exercise.description ?? 'No hay descripción para este ejercicio.'}
               equipment={exercise.equipment ?? 'Sin material'}
               isCompound={exercise.isCompound}
               videoUrl={exercise.videoUrl} />
         ) : null}

         {selectedTab === 'history' ? <ExerciseHistoryTab /> : null}

         {selectedTab === 'instructions' ? (
            <ExerciseInstructionsTab
               description={exercise.description}
               steps={instructionSteps}
            />
         ) : null}
      </ScrollView>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   content: {
      paddingBottom: 48,
      gap: 22,
   },
   panel: {
      borderRadius: 24,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 18,
      gap: 14,
   },
});
