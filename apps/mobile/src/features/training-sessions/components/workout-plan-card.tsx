import type { WorkoutPlan } from '@gym-app/types';
import { Appbar, Card, Text, Tooltip } from 'react-native-paper';

type WorkoutPlanCardProps = {
   workoutPlan: WorkoutPlan;
   onOpenOptions: () => void;
};

export function WorkoutPlanCard({
   workoutPlan,
   onOpenOptions,
}: WorkoutPlanCardProps) {
   return (
      <Card mode="outlined">
         <Card.Title
            title={workoutPlan.name}
            subtitle={workoutPlan.isActive ? 'Activa' : 'Inactiva'}
            right={() => (
               <Tooltip title="Opciones">
                  <Appbar.Action icon="dots-horizontal" onPress={onOpenOptions} />
               </Tooltip>
            )}
         />

         <Card.Content>
            <Text>
               {workoutPlan.description?.trim() || 'Sin descripción'}
            </Text>
         </Card.Content>
      </Card>
   );
}
