import { RefObject, useState } from 'react';
import { useWorkoutPlansQuery } from '../queries/use-workout-plans-query';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper/lib/typescript/core/theming';

interface TrainingSessionsViewProps {
   bottomSheetRef: RefObject<BottomSheet | null>;
}

export function useTrainingSessionsView({ bottomSheetRef }: TrainingSessionsViewProps) {
   const [expanded, setExpanded] = useState(true);

   // Query para obtener los datos del perfil actual
   const profileQuery = useWorkoutPlansQuery({ page: 0, limit: 10 });

   const { data, isLoading, isError } = profileQuery;

   const workoutPlans = data?.items ?? [];

   const handleOpenWorkoutOptions = () => {
      bottomSheetRef.current?.snapToIndex(0);
   };

   return {
      expanded,
      setExpanded,
      data,
      isLoading,
      isError,
      workoutPlans,
      handleOpenWorkoutOptions,
   };
}