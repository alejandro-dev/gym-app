import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Surface, Text, useTheme } from 'react-native-paper';

type NewRoutineHeroProps = {
   durationWeeks: string;
};

// Componente cabecera de la pantalla de inicio de una nueva rutina.
const NewRoutineHero = ({ durationWeeks }: NewRoutineHeroProps) => {
   const theme = useTheme();

   return (
      <Surface style={styles.hero} elevation={0}>
         <View style={styles.heroHeader}>
            <View style={styles.kicker}>
               <Text style={[styles.kickerText, { color: theme.colors.primary }]}>
                  Nueva rutina
               </Text>
            </View>
            <Text variant="headlineMedium" style={styles.title}>
               Diseña el bloque base
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
               Completa la información principal para dejar la rutina preparada antes de
               añadir ejercicios.
            </Text>
         </View>

         <View style={styles.heroStats}>
            <View style={styles.stat}>
               <Text style={styles.statValue}>0</Text>
               <Text style={styles.statLabel}>ejercicios</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.stat}>
               <Text style={styles.statValue}>
                  {durationWeeks === '' ? '0' : durationWeeks}
               </Text>
               <Text style={styles.statLabel}>semanas</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.stat}>
               <Text style={styles.statValue}>3</Text>
               <Text style={styles.statLabel}>días</Text>
            </View>
         </View>
      </Surface>
   );
};

export default memo(NewRoutineHero);

const styles = StyleSheet.create({
   hero: {
      gap: 22,
      borderRadius: 28,
      borderCurve: 'continuous',
      padding: 20,
      backgroundColor: '#0f172a',
   },
   heroHeader: {
      gap: 10,
   },
   kicker: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      backgroundColor: '#dbeafe',
      paddingHorizontal: 12,
      paddingVertical: 6,
   },
   kickerText: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
   },
   title: {
      color: '#f8fafc',
      fontWeight: '800',
   },
   description: {
      color: '#cbd5e1',
      lineHeight: 21,
   },
   heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 22,
      borderCurve: 'continuous',
      backgroundColor: '#1e293b',
      padding: 14,
   },
   stat: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
   },
   statValue: {
      color: '#f8fafc',
      fontSize: 22,
      fontWeight: '800',
   },
   statLabel: {
      color: '#94a3b8',
      fontSize: 12,
      fontWeight: '600',
   },
   statDivider: {
      width: 1,
      height: 34,
      backgroundColor: '#334155',
   },
});
