import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import useNewRutineView from '@/features/training-sessions/hooks/use-new-rutine-view';
import { useResetRoutineOnBack } from '@/features/training-sessions/hooks/use-reset-routine-on-back';
import NewRoutineView from '@/features/training-sessions/views/new-routine-view';

// Vista para crear una nueva rutina.
export default function NewRoutineScreen() {
   // Reseteamos la rutina cuando se navega hacia atrás.
   useResetRoutineOnBack();

   const {
      canSubmitRoutine,
      isCreatingRoutine,
      handleCreateRoutine,
   } = useNewRutineView();

   return (
      <ProtectedScreen edges={['left', 'right']}>
         <NewRoutineView
            mode="create"
            canSubmitRoutine={canSubmitRoutine}
            isSavingRoutine={isCreatingRoutine}
            onSubmitRoutine={handleCreateRoutine}
         />
      </ProtectedScreen>
   );
}
