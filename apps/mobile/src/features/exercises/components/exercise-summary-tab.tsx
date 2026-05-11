import { VIEW_COLORS } from "@/theme/colors";
import { View, StyleSheet, Linking } from "react-native";
import { useTheme, Text, Button, MD3Theme } from "react-native-paper";
import ExerciseInfoTitle from "./exercise-info-title";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

type ExerciseSummaryTabProps = {
   category: string;
   description: string | null;
   equipment: string | null;
   isCompound: boolean;
   videoUrl: string | null;
};

// Componente para mostrar el resumen de un ejercicio.
export default function ExerciseSummaryTab({
   category,
   description,
   equipment,
   isCompound,
   videoUrl,
}: ExerciseSummaryTabProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.sectionStack}>
         <View style={styles.statGrid}>
            <ExerciseInfoTitle icon="dumbbell" label="Categoría" value={category} />
            <ExerciseInfoTitle icon="toolbox-outline" label="Material" value={equipment ?? 'Sin material'} />
            <ExerciseInfoTitle
               icon="vector-polyline"
               label="Tipo"
               value={isCompound ? 'Multiarticular' : 'Aislado'}
            />
         </View>

         <View style={styles.panel}>
            <Text variant="titleMedium" style={styles.panelTitle}>
               Descripción
            </Text>
            <Text variant="bodyMedium" style={styles.paragraph}>
               {description?.trim() || 'Todavía no hay descripción para este ejercicio.'}
            </Text>
         </View>

          <View style={styles.panel}>
            <View style={styles.recordsHeader}>
               <MaterialDesignIcons
                  name="medal-outline"
                  color={VIEW_COLORS.onDark}
                  size={28}
               />
               <Text variant="titleMedium" style={styles.recordsTitle}>
                  Records personales
               </Text>
               <MaterialDesignIcons
                  name="help-circle-outline"
                  color={VIEW_COLORS.subtle}
                  size={22}
               />
            </View>

            <RecordRow label="Mayor peso" />
            <RecordRow label="Mejor 1RM" />
            <RecordRow label="Mejor volumen" />
         </View>

         {videoUrl !== null ? (
            <Button
               mode="contained"
               icon="play-circle-outline"
               buttonColor={VIEW_COLORS.onDark}
               textColor={theme.colors.onTertiary}
               style={styles.videoButton}
               contentStyle={styles.videoButtonContent}
               onPress={() => Linking.openURL(videoUrl)}
            >
               Ver vídeo
            </Button>
         ) : null}
      </View>
   );
}


function RecordRow({ label }: { label: string }) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.recordRow}>
         <Text variant="titleMedium" style={styles.recordLabel}>
            {label}
         </Text>
         <Text variant="titleMedium" style={styles.recordValue}>
            -
         </Text>
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   sectionStack: {
      gap: 18,
   },
   statGrid: {
      flexDirection: 'row',
      gap: 10,
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
   paragraph: {
      color: VIEW_COLORS.muted,
      fontSize: 15,
      lineHeight: 23,
   },
   videoButton: {
      borderRadius: 18,
   },
   videoButtonContent: {
      minHeight: 52,
   },
   recordsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
   },
   recordsTitle: {
      flex: 1,
      color: VIEW_COLORS.muted,
      fontWeight: '800',
   },
   recordRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopColor: theme.colors.outline,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingTop: 14,
   },
   recordLabel: {
      color: theme.colors.onSurface,
      fontWeight: '800',
   },
   recordValue: {
      color: theme.colors.onSurface,
      fontWeight: '900',
   },
});