import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, Checkbox, Divider, Text, TextInput } from 'react-native-paper';

import { AuthAppBar } from '@/features/auth/components/auth-app-bar';
import { AuthBrandIntro } from '@/features/auth/components/auth-brand-intro';
import { AuthFooterPrompt } from '@/features/auth/components/auth-footer-prompt';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import { AuthScreen } from '@/features/auth/components/auth-screen';
import { AuthSurfaceCard } from '@/features/auth/components/auth-surface-card';
import useLoginView from '@/features/auth/hooks/use-login-view';
import { AUTH_COLORS } from '@/theme/colors';

const LoginView = () => {
   const { control, errors, isSubmitting, handleLogin } = useLoginView();
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(true);

   return (
      <AuthScreen
         footer={
            <AuthFooterPrompt
               prompt="No tienes cuenta?"
               actionLabel="Registrate"
               onPress={() => {
                  router.navigate('/register');
               }}
            />
         }
      >
         <AuthAppBar title="Iniciar sesion" align="start" titleSize={26} />

         <AuthBrandIntro
            headline="Vuelve a tu rutina"
            subhead="Accede para continuar tu plan, registrar series y revisar tu progreso."
         />

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
                     autoCapitalize="none"
                     autoComplete="email"
                     keyboardType="email-address"
                     textContentType="emailAddress"
                     errorText={errors.email?.message}
                     placeholder="tu@email.com"
                  />
               )}
            />

            <Controller
               control={control}
               name="password"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Contrasena"
                     icon="lock-outline"
                     value={value}
                     onChangeText={onChange}
                     placeholder="••••••••"
                     secureTextEntry={!showPassword}
                     autoComplete="password"
                     textContentType="password"
                     errorText={errors.password?.message}
                     right={
                        <TextInput.Icon
                           icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                           color={AUTH_COLORS.muted}
                           onPress={() => setShowPassword((current) => !current)}
                        />
                     }
                  />
               )}
            />

            <View style={styles.actions}>
               <View style={styles.optionsRow}>
                  <Pressable
                     accessibilityRole="checkbox"
                     accessibilityState={{ checked: rememberMe }}
                     onPress={() => setRememberMe((current) => !current)}
                     style={styles.rememberRow}
                  >
                     <Checkbox
                        status={rememberMe ? 'checked' : 'unchecked'}
                        onPress={() => setRememberMe((current) => !current)}
                        color={AUTH_COLORS.primary}
                        uncheckedColor={AUTH_COLORS.muted}
                     />
                     <Text style={styles.rememberText}>Recordarme</Text>
                  </Pressable>

                  <Pressable onPress={() => router.navigate('/forgot-password')}>
                     <Text style={styles.forgotPasswordText}>¿Has olvidado tu contraseña?</Text>
                  </Pressable>
               </View>

               <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  buttonColor={AUTH_COLORS.primary}
                  textColor={AUTH_COLORS.primaryForeground}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Acceder
               </Button>

               <View style={styles.dividerRow}>
                  <Divider style={styles.divider} />
                  <Text style={styles.dividerText}>o</Text>
                  <Divider style={styles.divider} />
               </View>

               <Button
                  mode="outlined"
                  icon="google"
                  disabled={isSubmitting}
                  textColor={AUTH_COLORS.text}
                  contentStyle={styles.googleButtonContent}
                  style={styles.googleButton}
               >
                  Continuar con Google
               </Button>
            </View>
         </AuthSurfaceCard>
      </AuthScreen>
   );
};

const styles = StyleSheet.create({
   actions: {
      gap: 14,
   },
   button: {
      borderRadius: 999,
   },
   buttonContent: {
      minHeight: 52,
   },
   buttonLabel: {
      fontSize: 15,
      fontWeight: '800',
   },
   divider: {
      backgroundColor: AUTH_COLORS.elevatedOutline,
      flex: 1,
   },
   dividerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
   },
   dividerText: {
      color: '#9EA3AD',
      fontSize: 13,
   },
   forgotPasswordText: {
      color: AUTH_COLORS.primary,
      fontSize: 13,
      fontWeight: '700',
   },
   googleButton: {
      borderColor: '#49454F',
      borderRadius: 999,
   },
   googleButtonContent: {
      minHeight: 50,
   },
   optionsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   rememberRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginLeft: -8,
   },
   rememberText: {
      color: '#D6D9DF',
      fontSize: 13,
      fontWeight: '600',
      marginLeft: -2,
   },
});

export default memo(LoginView);
