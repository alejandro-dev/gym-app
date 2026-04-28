import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import AddRoutineExerciseView from '@/features/training-sessions/views/add-routine-exercise-view';

export default function AddRoutineExerciseScreen() {
   return (
      <ProtectedScreen>
         <AddRoutineExerciseView />
      </ProtectedScreen>
   );
}
