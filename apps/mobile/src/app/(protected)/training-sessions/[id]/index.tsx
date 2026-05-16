import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import RoutineDetailView from '@/features/training-sessions/views/routine-detail-view';

// Vista de detalle/maqueta de una rutina desde el listado.
export default function RoutineDetailScreen() {
   return (
      <ProtectedScreen edges={['left', 'right', 'top']}>
         <RoutineDetailView />
      </ProtectedScreen>
   );
}
