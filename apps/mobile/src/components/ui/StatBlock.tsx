import { StyleSheet, View } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { VIEW_COLORS } from "@/theme/colors";

type StatBlockProps = {
   label: string; 
   value: string;
}

export function StatBlock({ label, value }: StatBlockProps) {
   const styles = getStyles(useTheme());

   return (
      <View style={styles.stat}>
         <Text variant="bodyMedium" style={styles.statLabel}>
            {label}
         </Text>
         <Text variant="titleLarge" style={styles.statValue}>
            {value}
         </Text>
      </View>
   );
}

const getStyles = (theme: MD3Theme) =>
   StyleSheet.create({
      stat: {
         gap: 4,
      },
      statLabel: {
         color: VIEW_COLORS.subtle,
         fontSize: 12,
         lineHeight: 19,
      },
      statValue: {
         color: theme.colors.onBackground,
         fontSize: 18,
         fontWeight: "400",
         lineHeight: 26,
      },
   });
