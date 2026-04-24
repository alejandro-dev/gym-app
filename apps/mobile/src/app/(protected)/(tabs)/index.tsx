import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function ProtectedHomeScreen() {
   return (
      <ProtectedScreen style={styles.safeArea}>
         <ScrollView contentContainerStyle={styles.content}>
            <Text variant="headlineMedium">Bienvenido</Text>
            <Text variant="bodyMedium">
               Resumen rápido de actividad, progreso y accesos directos.
            </Text>

            <Card mode="contained">
               <Card.Content>
                  <Text variant="titleMedium">Entrenamiento de hoy</Text>
                  <Text variant="bodyMedium">Pierna y core - 5 ejercicios pendientes</Text>
               </Card.Content>
            </Card>

            <Card mode="contained">
               <Card.Content>
                  <Text variant="titleMedium">Progreso semanal</Text>
                  <Text variant="bodyMedium">Has completado 3 de 4 sesiones</Text>
               </Card.Content>
            </Card>
         </ScrollView>
      </ProtectedScreen>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
   },
   content: {
      gap: 16,
   },
});
