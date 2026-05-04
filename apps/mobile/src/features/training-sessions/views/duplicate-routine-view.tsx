import { ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

import useDuplicateRoutineView from '../hooks/use-duplicate-routine-view';
import NewRoutineView from './new-routine-view';

export default function DuplicateRoutineView() {
   const { id } = useLocalSearchParams<{ id: string }>();
   const workoutPlanId = Array.isArray(id) ? id[0] : id;

   const {
      data,
      isLoading,
      isError,
      canDuplicateRoutine,
      isDuplicatingRoutine,
      handleCreateDuplicateRoutine,
   } = useDuplicateRoutineView(workoutPlanId ?? '');

   if (isLoading) {
      return <ActivityIndicator />;
   }

   if (isError || !data) {
      return <Text>No se pudo cargar la rutina.</Text>;
   }

   return (
      <NewRoutineView
         mode="duplicate"
         canSubmitRoutine={canDuplicateRoutine}
         isSavingRoutine={isDuplicatingRoutine}
         onSubmitRoutine={handleCreateDuplicateRoutine}
      />
   );
}
