import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import AddRoutineExerciseView from '@/features/training-sessions/views/add-routine-exercise-view';

// Vista para añadir un ejercicio a la rutina junto con sus detalles.
export default function AddRoutineExerciseScreen() {
   return (
      <ProtectedScreen edges={['left', 'right']}>
         <AddRoutineExerciseView />
      </ProtectedScreen>
   );
}
