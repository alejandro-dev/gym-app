import { VIEW_COLORS } from "@/theme/colors";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { View, StyleSheet } from "react-native";
import { useTheme, Text, MD3Theme } from "react-native-paper";

type ExerciseInstructionsTabProps = {
   description: string | null;
   steps: string[];
};

// Componente para mostrar las instrucciones de un ejercicio.
export default function ExerciseInstructionsTab({ description, steps }: ExerciseInstructionsTabProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   const visibleSteps = steps.length > 0 ? steps : [
      description?.trim() || 'Mantén una técnica controlada durante todo el movimiento.',
   ];

   return (
      <View style={styles.sectionStack}>
         <View style={styles.panel}>
            <Text variant="titleMedium" style={styles.panelTitle}>
               Ejecución
            </Text>

            <View style={styles.stepsList}>
               {visibleSteps.map((step, index) => (
                  <View key={`${step}-${index}`} style={styles.stepRow}>
                     <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                     </View>
                     <Text variant="bodyMedium" style={styles.stepText}>
                        {step}
                     </Text>
                  </View>
               ))}
            </View>
         </View>

         <View style={styles.tipPanel}>
            <MaterialDesignIcons
               name="lightbulb-on-outline"
               color={VIEW_COLORS.onDark}
               size={24}
            />
            <Text variant="bodyMedium" style={styles.tipText}>
               Prioriza el rango completo y evita subir la carga si pierdes control.
            </Text>
         </View>
      </View>
   );
};

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   sectionStack: {
      gap: 18,
   },
   panel: {
      borderRadius: 24,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 18,
      gap: 14,
   },
   panelTitle: {
      color: theme.colors.onSurface,
      fontWeight: '900',
   },
   stepsList: {
      gap: 16,
   },
   stepRow: {
      flexDirection: 'row',
      gap: 12,
   },
   stepNumber: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      backgroundColor: VIEW_COLORS.onDark,
   },
   stepNumberText: {
      color: theme.colors.onTertiary,
      fontWeight: '900',
   },
   stepText: {
      flex: 1,
      color: VIEW_COLORS.muted,
      fontSize: 15,
      lineHeight: 23,
   },
   tipPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 20,
      borderCurve: 'continuous',
      borderColor: theme.colors.outline,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 16,
   },
   tipText: {
      flex: 1,
      color: theme.colors.onBackground,
      lineHeight: 22,
   },
});