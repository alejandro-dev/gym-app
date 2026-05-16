import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import ExercisePickerView from '@/features/exercises/views/exercise-list-view';

// Vista del listado de ejercicios para seleccionarlo en la rutina.
export default function ExercisePickerScreen() {
   return (
      <ProtectedScreen edges={['top', 'left', 'right']}>
         <ExercisePickerView />
      </ProtectedScreen>
   );
}
