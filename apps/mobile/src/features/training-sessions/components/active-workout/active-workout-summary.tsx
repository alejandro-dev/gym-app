import { VIEW_COLORS } from "@/theme/colors";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, MD3Theme } from "react-native-paper";

type ActiveWorkoutSummaryProps = {
   label: string;
   value: string;
   highlighted?: boolean;
};

export default function ActiveWorkoutSummary({
   label,
   value,
   highlighted,
}: ActiveWorkoutSummaryProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.metric}>
         <Text style={styles.metricLabel}>{label}</Text>
         <Text style={[styles.metricValue, highlighted && styles.highlightedMetric]}>
            {value}
         </Text>
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   metric: {
      flex: 1,
      gap: 8,
   },
   metricLabel: {
      color: VIEW_COLORS.muted,
      fontSize: 14,
      fontWeight: '700',
   },
   metricValue: {
      color: theme.colors.onBackground,
      fontSize: 22,
      fontWeight: '800',
   },
   highlightedMetric: {
      color: theme.colors.primary,
   },
});