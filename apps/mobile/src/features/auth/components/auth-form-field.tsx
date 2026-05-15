import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';

import { AUTH_COLORS } from '@/theme/colors';

type PaperTextInputProps = ComponentProps<typeof TextInput>;

interface AuthFormFieldProps
   extends Omit<
      PaperTextInputProps,
      'mode' | 'label' | 'left' | 'outlineColor' | 'activeOutlineColor' | 'textColor'
   > {
   label: string;
   icon: ComponentProps<typeof MaterialDesignIcons>['name'];
   errorText?: string;
}

export function AuthFormField({
   label,
   icon,
   errorText,
   style,
   ...props
}: AuthFormFieldProps) {
   return (
      <View style={styles.container}>
         <Text style={styles.label}>{label}</Text>
         <TextInput
            {...props}
            mode="outlined"
            error={Boolean(errorText)}
            left={<TextInput.Icon icon={icon} color={AUTH_COLORS.muted} />}
            outlineColor={AUTH_COLORS.fieldOutline}
            activeOutlineColor={AUTH_COLORS.primary}
            textColor={AUTH_COLORS.text}
            placeholderTextColor={AUTH_COLORS.muted}
            style={[styles.input, style]}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
         />
         <HelperText type="error" visible={Boolean(errorText)} style={styles.helper}>
            {errorText}
         </HelperText>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      gap: 5,
   },
   helper: {
      marginBottom: -4,
      marginTop: -4,
      minHeight: 0,
      paddingHorizontal: 0,
   },
   input: {
      backgroundColor: AUTH_COLORS.field,
      height: 48,
   },
   inputContent: {
      color: AUTH_COLORS.text,
      fontSize: 15,
      minHeight: 48,
      paddingHorizontal: 0,
   },
   inputOutline: {
      borderRadius: 12,
   },
   label: {
      color: AUTH_COLORS.muted,
      fontSize: 12,
      fontWeight: '600',
   },
});
