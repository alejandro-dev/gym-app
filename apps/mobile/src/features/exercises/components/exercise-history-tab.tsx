import { View, StyleSheet } from "react-native";
import { Text, useTheme, MD3Theme } from "react-native-paper";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { VIEW_COLORS } from "@/theme/colors";

export default function ExerciseHistoryTab() {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.sectionStack}>
         <View style={styles.chartPanel}>
            <MaterialDesignIcons
               name="chart-bar"
               color={VIEW_COLORS.muted}
               size={48}
            />
            <Text variant="titleMedium" style={styles.emptyDataText}>
               Aún no hay datos
            </Text>
         </View>
      </View>
   );
}


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
   chartPanel: {
      minHeight: 210,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      borderRadius: 24,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceVariant,
   },
   emptyDataText: {
      color: VIEW_COLORS.muted,
      fontWeight: '800',
   },
   metricTabs: {
      flexDirection: 'row',
      gap: 10,
   },
   metricPill: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceVariant,
      color: theme.colors.onSurface,
      fontSize: 13,
      fontWeight: '800',
      paddingHorizontal: 10,
      paddingVertical: 10,
      textAlign: 'center',
   },
   metricPillActive: {
      backgroundColor: VIEW_COLORS.onDark,
      color: theme.colors.onTertiary,
   },
});