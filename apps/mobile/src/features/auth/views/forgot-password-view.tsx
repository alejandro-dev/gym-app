import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, Text } from 'react-native-paper';

import { AuthAppBar } from '@/features/auth/components/auth-app-bar';
import { AuthFooterPrompt } from '@/features/auth/components/auth-footer-prompt';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import { AuthScreen } from '@/features/auth/components/auth-screen';
import { AuthSurfaceCard } from '@/features/auth/components/auth-surface-card';
import useForgotPasswordView from '@/features/auth/hooks/use-forgot-password-view';
import { AUTH_COLORS } from '@/theme/colors';

const ForgotPasswordView = () => {
   const { control, errors, isSubmitting, handleForgotPassword } =
      useForgotPasswordView();

   return (
      <AuthScreen
         footer={
            <AuthFooterPrompt
               prompt="Ya recuerdas tu contrasena?"
               actionLabel="Iniciar sesion"
               onPress={() => router.navigate('/login')}
            />
         }
      >
         <AuthAppBar title="Recordar contrasena" align="start" titleSize={24} />

         <View style={styles.hero}>
            <View style={styles.iconSurface}>
               <MaterialDesignIcons name="key-variant" color={AUTH_COLORS.primary} size={42} />
            </View>

            <View style={styles.copy}>
               <Text style={styles.title}>Recupera el acceso</Text>
               <Text style={styles.subhead}>
                  Introduce tu email y te enviaremos instrucciones para crear una nueva contrasena.
               </Text>
            </View>
         </View>

         <AuthSurfaceCard>
            <Controller
               control={control}
               name="email"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Email"
                     icon="email-outline"
                     value={value}
                     onChangeText={onChange}
                     placeholder="tu@email.com"
                     autoCapitalize="none"
                     autoComplete="email"
                     keyboardType="email-address"
                     textContentType="emailAddress"
                     errorText={errors.email?.message}
                  />
               )}
            />

            <Button
               mode="contained"
               onPress={handleForgotPassword}
               loading={isSubmitting}
               disabled={isSubmitting}
               buttonColor={AUTH_COLORS.primary}
               textColor={AUTH_COLORS.primaryForeground}
               contentStyle={styles.buttonContent}
               labelStyle={styles.buttonLabel}
               style={styles.button}
            >
               Enviar enlace
            </Button>
         </AuthSurfaceCard>

         <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/login')}
            style={styles.helpBanner}
         >
            <MaterialDesignIcons name="information-outline" color={AUTH_COLORS.primary} size={18} />
            <Text style={styles.helpText}>
               Si no lo ves en unos minutos, revisa spam o intenta con otro email.
            </Text>
         </Pressable>
      </AuthScreen>
   );
};

const styles = StyleSheet.create({
   button: {
      borderRadius: 26,
   },
   buttonContent: {
      minHeight: 52,
   },
   buttonLabel: {
      fontSize: 15,
      fontWeight: '800',
   },
   copy: {
      alignItems: 'center',
      gap: 8,
      width: '100%',
   },
   helpBanner: {
      alignItems: 'flex-start',
      backgroundColor: AUTH_COLORS.helpSurface,
      borderRadius: 12,
      flexDirection: 'row',
      gap: 10,
      padding: 12,
   },
   helpText: {
      color: AUTH_COLORS.warningText,
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
   },
   hero: {
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 18,
      paddingVertical: 18,
   },
   iconSurface: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 26,
      borderWidth: 1,
      height: 92,
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: {
         width: 0,
         height: 4,
      },
      shadowOpacity: 0.33,
      shadowRadius: 12,
      width: 92,
   },
   subhead: {
      color: AUTH_COLORS.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
   },
   title: {
      color: AUTH_COLORS.text,
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
   },
});

export default memo(ForgotPasswordView);
