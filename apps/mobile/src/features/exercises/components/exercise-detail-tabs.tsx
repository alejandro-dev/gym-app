import { Pressable, View, StyleSheet } from "react-native";
import { Text, useTheme, MD3Theme } from "react-native-paper";
import { ExerciseTab } from "../views/exercise-detail-view";
import { VIEW_COLORS } from "@/theme/colors";

const TABS: { value: ExerciseTab; label: string }[] = [
   { value: 'summary', label: 'Resumen' },
   { value: 'history', label: 'Historia' },
   { value: 'instructions', label: 'Indicaciones' },
];

type ExerciseDetailTabsProps = {
   selectedTab: ExerciseTab;
   setSelectedTab: (tab: ExerciseTab) => void;
};

// Componente para mostrar las pestañas de detalle de ejercicio.
export default function ExerciseDetailTabs({ selectedTab, setSelectedTab }: ExerciseDetailTabsProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   return (
      <View style={styles.tabBar}>
         {TABS.map((tab) => {
            const isSelected = selectedTab === tab.value;

            return (
               <Pressable
                  key={tab.value}
                  onPress={() => setSelectedTab(tab.value)}
                  style={styles.tabButton}
               >
                  <Text
                     variant="titleSmall"
                     style={[
                        styles.tabText,
                        isSelected && styles.tabTextSelected,
                     ]}
                  >
                     {tab.label}
                  </Text>
                  <View
                     style={[
                        styles.tabIndicator,
                        isSelected && styles.tabIndicatorSelected,
                     ]}
                  />
               </Pressable>
            );
         })}
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   tabBar: {
      flexDirection: 'row',
      marginTop: 20,
      borderBottomColor: theme.colors.outline,
      borderBottomWidth: StyleSheet.hairlineWidth,
   },
   tabButton: {
      flex: 1,
      alignItems: 'center',
      gap: 12,
      paddingTop: 2,
   },
   tabText: {
      color: VIEW_COLORS.muted,
      fontSize: 16,
      fontWeight: '800',
   },
   tabTextSelected: {
      color: VIEW_COLORS.onDark,
   },
   tabIndicator: {
      width: '100%',
      height: 3,
      backgroundColor: 'transparent',
   },
   tabIndicatorSelected: {
   backgroundColor: VIEW_COLORS.onDark,
   },
});