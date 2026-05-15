import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, TextInput } from 'react-native-paper';

import { AuthAppBar } from '@/features/auth/components/auth-app-bar';
import { AuthBrandIntro } from '@/features/auth/components/auth-brand-intro';
import { AuthFooterPrompt } from '@/features/auth/components/auth-footer-prompt';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import { AuthScreen } from '@/features/auth/components/auth-screen';
import { AuthSurfaceCard } from '@/features/auth/components/auth-surface-card';
import { AuthTermsCheckbox } from '@/features/auth/components/auth-terms-checkbox';
import useRegisterView from '@/features/auth/hooks/use-register-view';
import { AUTH_COLORS } from '@/theme/colors';

const RegisterView = () => {
   const { control, errors, isSubmitting, handleRegister } = useRegisterView();
   const [showPassword, setShowPassword] = useState(false);

   return (
      <AuthScreen
         footer={
            <AuthFooterPrompt
               prompt="Ya tienes cuenta?"
               actionLabel="Inicia sesion"
               onPress={() => router.navigate('/login')}
            />
         }
      >
         <AuthAppBar title="Registro" />

         <AuthBrandIntro
            headline="Prepara tu perfil GymFit en menos de un minuto."
            subhead="Datos clave para ajustar rutinas, objetivos y progreso desde el primer entrenamiento."
         />

         <AuthSurfaceCard>
            <Controller
               control={control}
               name="name"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Nombre"
                     icon="account-outline"
                     value={value}
                     onChangeText={onChange}
                     placeholder="Nombre"
                     autoCapitalize="words"
                     autoComplete="name"
                     textContentType="name"
                     errorText={errors.name?.message}
                  />
               )}
            />

            <Controller
               control={control}
               name="email"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Email"
                     icon="at"
                     value={value}
                     onChangeText={onChange}
                     placeholder="Email"
                     autoCapitalize="none"
                     autoComplete="email"
                     keyboardType="email-address"
                     textContentType="emailAddress"
                     errorText={errors.email?.message}
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
                     placeholder="Contrasena"
                     secureTextEntry={!showPassword}
                     autoComplete="password-new"
                     textContentType="newPassword"
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

            <Controller
               control={control}
               name="confirmPassword"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Confirmar"
                     icon="lock-reset"
                     value={value}
                     onChangeText={onChange}
                     placeholder="Confirmar"
                     secureTextEntry={!showPassword}
                     autoComplete="password-new"
                     textContentType="newPassword"
                     errorText={errors.confirmPassword?.message}
                  />
               )}
            />

            <Controller
               control={control}
               name="birthDate"
               render={({ field: { onChange, value } }) => (
                  <AuthFormField
                     label="Fecha de nacimiento"
                     icon="calendar-month-outline"
                     value={value}
                     onChangeText={onChange}
                     placeholder="YYYY-MM-DD"
                     autoCapitalize="none"
                     keyboardType="numbers-and-punctuation"
                     errorText={errors.birthDate?.message}
                  />
               )}
            />

            <View style={styles.fieldRow}>
               <View style={styles.fieldColumn}>
                  <Controller
                     control={control}
                     name="weightKg"
                     render={({ field: { onChange, value } }) => (
                        <AuthFormField
                           label="Peso"
                           icon="scale-bathroom"
                           value={value}
                           onChangeText={onChange}
                           placeholder="Peso"
                           keyboardType="decimal-pad"
                           errorText={errors.weightKg?.message}
                           right={<TextInput.Affix text="kg" textStyle={styles.affix} />}
                        />
                     )}
                  />
               </View>

               <View style={styles.fieldColumn}>
                  <Controller
                     control={control}
                     name="heightCm"
                     render={({ field: { onChange, value } }) => (
                        <AuthFormField
                           label="Altura"
                           icon="human-male-height"
                           value={value}
                           onChangeText={onChange}
                           placeholder="Altura"
                           keyboardType="number-pad"
                           errorText={errors.heightCm?.message}
                           right={<TextInput.Affix text="cm" textStyle={styles.affix} />}
                        />
                     )}
                  />
               </View>
            </View>

            <Controller
               control={control}
               name="acceptedTerms"
               render={({ field: { onChange, value } }) => (
                  <AuthTermsCheckbox
                     checked={value}
                     onChange={onChange}
                     errorText={errors.acceptedTerms?.message}
                  />
               )}
            />

            <View style={styles.actions}>
               <Button
                  mode="contained"
                  icon="arrow-right"
                  onPress={handleRegister}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  buttonColor={AUTH_COLORS.primary}
                  textColor={AUTH_COLORS.primaryForeground}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Crear cuenta
               </Button>
            </View>
         </AuthSurfaceCard>
      </AuthScreen>
   );
};

const styles = StyleSheet.create({
   affix: {
      color: AUTH_COLORS.primary,
      fontSize: 12,
      fontWeight: '700',
   },
   actions: {
      gap: 12,
   },
   button: {
      borderRadius: 26,
   },
   buttonContent: {
      flexDirection: 'row-reverse',
      minHeight: 50,
   },
   buttonLabel: {
      fontSize: 15,
      fontWeight: '700',
   },
   fieldColumn: {
      flex: 1,
      minWidth: 0,
   },
   fieldRow: {
      flexDirection: 'row',
      gap: 8,
   },
});

export default memo(RegisterView);
