import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Surface, Text, useTheme } from 'react-native-paper';
import { VIEW_COLORS } from '@/theme/colors';

type NewRoutineHeroProps = {
   exerciseCount: number;
};

// Componente cabecera de la pantalla de inicio de una nueva rutina.
const NewRoutineHero = ({ exerciseCount }: NewRoutineHeroProps) => {
   const theme = useTheme();

   return (
      <Surface style={[styles.hero, { backgroundColor: theme.colors.surface }]} elevation={0}>
         <View style={styles.heroHeader}>
            <View style={[styles.kicker, { backgroundColor: '#FFFFFF' }]}>
               <Text style={[styles.kickerText, { color: theme.colors.onTertiary }]}>
                  Nueva rutina
               </Text>
            </View>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
               Diseña el bloque base
            </Text>
            <Text
               variant="bodyMedium"
               style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
               Completa la información principal y añade los ejercicios en el orden
               en el que quieres entrenarlos.
            </Text>
         </View>

         <View style={[styles.heroStats, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.stat}>
               <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {exerciseCount}
               </Text>
               <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>ejercicios</Text>
            </View>
            <Divider style={[styles.statDivider, { backgroundColor: theme.colors.outline }]} />
            <View style={styles.stat}>
               <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>Auto</Text>
               <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>orden</Text>
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
   },
   heroHeader: {
      gap: 10,
   },
   kicker: {
      alignSelf: 'flex-start',
      borderRadius: 999,
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
      fontWeight: '800',
   },
   description: {
      lineHeight: 21,
   },
   heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 22,
      borderCurve: 'continuous',
      padding: 14,
      borderColor: VIEW_COLORS.borderColor,
      borderWidth: 0.5,
   },
   stat: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
   },
   statValue: {
      fontSize: 22,
      fontWeight: '800',
   },
   statLabel: {
      fontSize: 12,
      fontWeight: '600',
   },
   statDivider: {
      width: 1,
      height: 34,
   },
});
