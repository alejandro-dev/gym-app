import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Surface, Switch, Text } from 'react-native-paper';

interface RoutineAssignAthleteCardProps {
   assignAthlete: boolean;
   onAssignAthleteChange: (assignAthlete: boolean) => void;
}

const RoutineAssignAthleteCard = ({
   assignAthlete,
   onAssignAthleteChange,
}: RoutineAssignAthleteCardProps) => (
   <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.cardContent}>
         <View style={styles.assignRow}>
            <View style={styles.assignCopy}>
               <Text variant="titleMedium" style={styles.sectionTitle}>
                  Asignar atleta
               </Text>
               <Text variant="bodySmall" style={styles.sectionHint}>
                  Puedes dejarla como plantilla si aún no tienes atleta.
               </Text>
            </View>
            <Switch value={assignAthlete} onValueChange={onAssignAthleteChange} />
         </View>

         {assignAthlete ? (
            <Surface style={styles.athleteCard} elevation={0}>
               <View style={styles.avatar}>
                  <Text style={styles.avatarText}>AM</Text>
               </View>
               <View style={styles.athleteInfo}>
                  <Text variant="titleSmall" style={styles.athleteName}>
                     Alex Martínez
                  </Text>
                  <Text variant="bodySmall" style={styles.sectionHint}>
                     alex.martinez@email.com
                  </Text>
               </View>
               <IconButton icon="chevron-right" size={22} />
            </Surface>
         ) : null}
      </Card.Content>
   </Card>
);

export default memo(RoutineAssignAthleteCard);

const styles = StyleSheet.create({
   card: {
      borderRadius: 26,
      borderCurve: 'continuous',
   },
   cardContent: {
      gap: 16,
      paddingVertical: 18,
   },
   sectionTitle: {
      fontWeight: '800',
   },
   sectionHint: {
      color: '#64748b',
      lineHeight: 18,
   },
   assignRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
   },
   assignCopy: {
      flex: 1,
      gap: 4,
   },
   athleteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 22,
      borderCurve: 'continuous',
      backgroundColor: '#1c1c1c',
      paddingLeft: 12,
      paddingVertical: 8,
   },
   avatar: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: '#2563eb',
   },
   avatarText: {
      color: '#fff',
      fontWeight: '800',
   },
   athleteInfo: {
      flex: 1,
      paddingLeft: 12,
   },
   athleteName: {
      fontWeight: '800',
   },
});
