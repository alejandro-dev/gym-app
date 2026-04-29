import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import EditRoutineView from '@/features/training-sessions/views/edit-routine-view';

// Vista para editar una rutina existente.
export default function EditRoutineScreen() {
   return (
      <ProtectedScreen edges={['left', 'right']}>
         <EditRoutineView />
      </ProtectedScreen>
   );
}
