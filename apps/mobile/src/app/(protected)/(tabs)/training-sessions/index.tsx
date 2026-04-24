import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import TrainingSessionsView from '@/features/training-sessions/views/training-sessions-view';
import { StyleSheet } from 'react-native';



export default function WorkoutsScreen() {
   return (
      <ProtectedScreen style={styles.safeArea}>
         <TrainingSessionsView />
      </ProtectedScreen>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,

   },
   content: {
      gap: 12,
   },
});
