import { View, StyleSheet } from "react-native";
import { Text, useTheme, MD3Theme } from "react-native-paper";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { VIEW_COLORS } from "@/theme/colors";
import { ComponentProps } from "react";

type MaterialDesignIconName = ComponentProps<typeof MaterialDesignIcons>['name'];

type ExerciseInfoTitleProps = {
   icon: MaterialDesignIconName;
   label: string;
   value: string;
};

// Componente para mostrar un título de información de un ejercicio.
export default function ExerciseInfoTitle({ 
   icon,
   label,
   value, 
}: ExerciseInfoTitleProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.infoTile}>
         <MaterialDesignIcons
            name={icon}
            color={VIEW_COLORS.onDark}
            size={24}
         />
         <Text variant="labelMedium" style={styles.infoLabel}>
            {label}
         </Text>
         <Text variant="titleSmall" style={styles.infoValue} numberOfLines={2}>
            {value}
         </Text>
      </View>
   );
}
const getStyles = (theme: MD3Theme) => StyleSheet.create({
   infoTile: {
      flex: 1,
      minHeight: 118,
      justifyContent: 'space-between',
      borderRadius: 22,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 14,
   },
   infoLabel: {
      color: VIEW_COLORS.muted,
      fontWeight: '700',
   },
   infoValue: {
      color: theme.colors.onSurface,
      fontWeight: '900',
      lineHeight: 20,
   },
});