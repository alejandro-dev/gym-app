import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import NewRoutineView from '@/features/training-sessions/views/new-routine-view';

export default function NewRoutineScreen() {
   return (
      <ProtectedScreen>
         <NewRoutineView />
      </ProtectedScreen>
   );
}
