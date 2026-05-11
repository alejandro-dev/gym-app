import type { WorkoutPlan } from '@gym-app/types';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, Card, Text, Tooltip } from 'react-native-paper';

type WorkoutPlanCardProps = {
   workoutPlan: WorkoutPlan;
   onOpenInfo: (workoutPlan: WorkoutPlan) => void;
   onOpenOptions: (workoutPlan: WorkoutPlan) => void;
};

// Componente para mostrar una rutina en una lista de rutinas.
export function WorkoutPlanCard({
   workoutPlan,
   onOpenInfo,
   onOpenOptions,
}: WorkoutPlanCardProps) {

   // Evento para iniciar la rutina seleccionada.
   const handleStartRoutine = (workoutPlanId: string) => {
      router.push({
         pathname: '/(protected)/training-sessions/[id]/start',
         params: {
            id: workoutPlanId,
         },
      });
   };

   return (
      <Card mode="outlined" onPress={() => onOpenInfo(workoutPlan)}>
         <Card.Title
            title={workoutPlan.name}
            subtitle={workoutPlan.isActive ? 'Activa' : 'Inactiva'}
            right={() => (
               <Tooltip title="Opciones">
                  <Appbar.Action
                     icon="dots-horizontal"
                     onPress={() => onOpenOptions(workoutPlan)}
                  />
               </Tooltip>
            )}
         />

         <Card.Content>
            <Text>
               {workoutPlan.description?.trim() || 'Sin descripción'}
            </Text>
         </Card.Content>
         <View>
            <Button
               mode="contained"
               labelStyle={styles.buttonLabel}
               style={styles.button}
               contentStyle={styles.buttonContent}
               onPress={() => handleStartRoutine(workoutPlan.id)}
            >
               Empezar rutina
            </Button>
         </View>
      </Card>
   );
}

const styles = StyleSheet.create({
   button: {
      marginVertical: 20,
      marginHorizontal: 12,
      borderRadius: 12,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 34,
   },
   buttonLabel: {
      fontSize: 16,
   },
});