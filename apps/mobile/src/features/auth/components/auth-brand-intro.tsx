import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthBrandIntroProps {
   headline: string;
   subhead: string;
}

export function AuthBrandIntro({ headline, subhead }: AuthBrandIntroProps) {
   return (
      <View style={styles.container}>
         <View style={styles.brandRow}>
            <View style={styles.mark}>
               <MaterialDesignIcons
                  name="dumbbell"
                  color={AUTH_COLORS.primaryForeground}
                  size={22}
               />
            </View>
            <Text style={styles.brand}>GymFit</Text>
         </View>

         <Text style={styles.headline}>{headline}</Text>
         <Text style={styles.subhead}>{subhead}</Text>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      gap: 6,
      width: '100%',
   },
   brand: {
      color: AUTH_COLORS.text,
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '700',
   },
   brandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      width: '100%',
   },
   headline: {
      color: AUTH_COLORS.text,
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 26,
   },
   mark: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 19,
      height: 38,
      justifyContent: 'center',
      width: 38,
   },
   subhead: {
      color: AUTH_COLORS.muted,
      fontSize: 13,
      lineHeight: 18,
   },
});
