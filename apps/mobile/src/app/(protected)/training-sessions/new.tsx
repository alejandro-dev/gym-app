import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import NewRoutineView from '@/features/training-sessions/views/new-routine-view';

// Vista para crear una nueva rutina.
export default function NewRoutineScreen() {
   return (
      <ProtectedScreen edges={['left', 'right']}>
         <NewRoutineView mode="create"/>
      </ProtectedScreen>
   );
}
