import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import useWelcomeView from '@/features/auth/hooks/use-welcome-view';
import { AUTH_COLORS } from '@/theme/colors';

const WelcomeView = () => {
   const { goToLogin, goToRegister } = useWelcomeView();

   return (
      <SafeAreaView style={styles.screen}>
         <View style={styles.content}>
            <View style={styles.hero}>
               <View style={styles.brandMark}>
                  <MaterialDesignIcons
                     name="dumbbell"
                     color={AUTH_COLORS.primary}
                     size={52}
                  />
               </View>

               <View style={styles.copy}>
                  <Text style={styles.brand}>GymFit</Text>
                  <Text style={styles.headline}>
                     Entrena con planes claros y registra cada repeticion
                  </Text>
                  <Text style={styles.subhead}>
                     Rutinas, progreso y sesiones guiadas en una experiencia preparada para
                     React Native Paper.
                  </Text>
               </View>
            </View>

            <View style={styles.previewCard}>
               <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Hoy: Push superior</Text>
                  <View style={styles.durationChip}>
                     <Text style={styles.durationText}>65 MIN</Text>
                  </View>
               </View>

               <ProgressBar
                  progress={0.64}
                  color={AUTH_COLORS.primary}
                  style={styles.progress}
               />

               <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                     <Text style={styles.statValue}>8</Text>
                     <Text style={styles.statLabel}>ejercicios</Text>
                  </View>
                  <View style={styles.statCard}>
                     <Text style={styles.statValue}>14</Text>
                     <Text style={styles.statLabel}>series</Text>
                  </View>
                  <View style={styles.statCard}>
                     <Text style={[styles.statValue, styles.statValueAccent]}>+7%</Text>
                     <Text style={styles.statLabel}>fuerza</Text>
                  </View>
               </View>
            </View>
         </View>

         <View style={styles.actions}>
            <Button
               mode="contained"
               onPress={goToLogin}
               buttonColor={AUTH_COLORS.primary}
               textColor={AUTH_COLORS.primaryForeground}
               contentStyle={styles.primaryButtonContent}
               labelStyle={styles.primaryButtonLabel}
               style={styles.primaryButton}
            >
               Iniciar sesion
            </Button>

            <Button
               mode="outlined"
               onPress={goToRegister}
               textColor={AUTH_COLORS.text}
               contentStyle={styles.secondaryButtonContent}
               labelStyle={styles.secondaryButtonLabel}
               style={styles.secondaryButton}
            >
               Registrarse
            </Button>
         </View>
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   actions: {
      gap: 12,
      paddingHorizontal: 20,
   },
   brand: {
      color: AUTH_COLORS.text,
      fontSize: 34,
      fontWeight: '800',
      textAlign: 'center',
   },
   brandMark: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 28,
      borderWidth: 1,
      height: 108,
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: {
         width: 0,
         height: 6,
      },
      shadowOpacity: 0.4,
      shadowRadius: 18,
      width: 108,
   },
   content: {
      flex: 1,
      gap: 20,
      justifyContent: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 20,
   },
   copy: {
      alignItems: 'center',
      gap: 10,
      width: '100%',
   },
   durationChip: {
      alignItems: 'center',
      backgroundColor: '#2A2119',
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
   },
   durationText: {
      color: AUTH_COLORS.primary,
      fontSize: 11,
      fontWeight: '700',
   },
   headline: {
      color: AUTH_COLORS.text,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
   },
   hero: {
      alignItems: 'center',
      gap: 20,
   },
   previewCard: {
      marginTop: 4,
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 20,
      borderWidth: 1,
      gap: 12,
      padding: 16,
   },
   previewHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   previewTitle: {
      color: AUTH_COLORS.text,
      fontSize: 16,
      fontWeight: '700',
   },
   primaryButton: {
      borderRadius: 999,
   },
   primaryButtonContent: {
      minHeight: 52,
   },
   primaryButtonLabel: {
      fontSize: 15,
      fontWeight: '800',
   },
   progress: {
      backgroundColor: '#302D36',
      borderRadius: 999,
      height: 8,
   },
   screen: {
      backgroundColor: AUTH_COLORS.background,
      flex: 1,
      paddingBottom: 28,
   },
   secondaryButton: {
      borderColor: '#49454F',
      borderRadius: 999,
      borderWidth: 1,
   },
   secondaryButtonContent: {
      minHeight: 52,
   },
   secondaryButtonLabel: {
      fontSize: 15,
      fontWeight: '800',
   },
   statCard: {
      backgroundColor: '#211F26',
      borderRadius: 12,
      flex: 1,
      gap: 4,
      padding: 10,
   },
   statLabel: {
      color: '#9EA3AD',
      fontSize: 11,
   },
   statValue: {
      color: AUTH_COLORS.text,
      fontSize: 20,
      fontWeight: '800',
   },
   statValueAccent: {
      color: AUTH_COLORS.primary,
   },
   statsRow: {
      flexDirection: 'row',
      gap: 10,
   },
   subhead: {
      color: '#B8BCC6',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
   },
});

export default memo(WelcomeView);
