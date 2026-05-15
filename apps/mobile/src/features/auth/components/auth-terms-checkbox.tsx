import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { HelperText, Text } from 'react-native-paper';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthTermsCheckboxProps {
   checked: boolean;
   errorText?: string;
   onChange: (checked: boolean) => void;
}

export function AuthTermsCheckbox({
   checked,
   errorText,
   onChange,
}: AuthTermsCheckboxProps) {
   return (
      <View>
         <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            onPress={() => onChange(!checked)}
            style={styles.row}
         >
            <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
               {checked ? (
                  <MaterialDesignIcons name="check" color={AUTH_COLORS.primary} size={14} />
               ) : null}
            </View>
            <Text style={styles.text}>Acepto los terminos y la politica de privacidad.</Text>
         </Pressable>
         <HelperText type="error" visible={Boolean(errorText)} style={styles.helper}>
            {errorText}
         </HelperText>
      </View>
   );
}

const styles = StyleSheet.create({
   checkbox: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.field,
      borderColor: AUTH_COLORS.field,
      borderRadius: 6,
      borderWidth: 1,
      height: 22,
      justifyContent: 'center',
      width: 22,
   },
   checkboxChecked: {
      borderColor: AUTH_COLORS.primary,
   },
   helper: {
      marginBottom: -4,
      marginTop: -4,
      minHeight: 0,
      paddingHorizontal: 0,
   },
   row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      width: '100%',
   },
   text: {
      color: AUTH_COLORS.muted,
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
   },
});
