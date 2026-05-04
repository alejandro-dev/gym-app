import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import { useResetRoutineOnBack } from '@/features/training-sessions/hooks/use-reset-routine-on-back';
import DuplicateRoutineView from '@/features/training-sessions/views/duplicate-routine-view';

export default function DuplicateRoutineScreen() {
   // Reseteamos la rutina cuando se navega hacia atrás.
   useResetRoutineOnBack();

   return (
      <ProtectedScreen edges={['left', 'right']}>
         <DuplicateRoutineView />
      </ProtectedScreen>
   );
}
