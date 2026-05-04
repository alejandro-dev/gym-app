import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthFooterPrompt } from '@/features/auth/components/AuthFooterPrompt';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { AUTH_INPUT_BACKGROUND, AUTH_INPUT_PROPS } from '@/features/auth/constants/auth-input';
import useLoginView from '@/features/auth/hooks/use-login-view';
import { VIEW_COLORS } from '@/theme/colors';

const LoginView = () => {
   const { control, errors, isSubmitting, handleLogin } = useLoginView();
   const [showPassword, setShowPassword] = useState(false);

   return (
      <AuthScreen
         footer={
            <AuthFooterPrompt
               prompt="¿No tienes cuenta todavia?"
               actionLabel="Crear cuenta"
               onPress={() => {
                  router.navigate('/register');
               }}
            />
         }
      >
         <AuthCard
            title="Bienvenido de vuelta"
            description="Inicia sesion para continuar con la planificacion y el seguimiento del dia."
         >
            <View className="gap-4">
               <View>
                  <Controller
                     control={control}
                     name="email"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           {...AUTH_INPUT_PROPS}
                           mode="outlined"
                           label="Email"
                           value={value}
                           onChangeText={onChange}
                           autoCapitalize="none"
                           autoComplete="email"
                           keyboardType="email-address"
                           textContentType="emailAddress"
                           error={Boolean(errors.email)}
                           style={styles.input}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="email-outline" />}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.email)}>
                     {errors.email?.message}
                  </HelperText>
               </View>

               <View>
                  <Controller
                     control={control}
                     name="password"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           {...AUTH_INPUT_PROPS}
                           mode="outlined"
                           label="Contrasena"
                           value={value}
                           onChangeText={onChange}
                           secureTextEntry={!showPassword}
                           autoComplete="password"
                           textContentType="password"
                           error={Boolean(errors.password)}
                           style={styles.input}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="lock-outline" />}
                           right={
                              <TextInput.Icon
                                 icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                 onPress={() => setShowPassword((current) => !current)}
                              />
                           }
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.password)}>
                     {errors.password?.message}
                  </HelperText>
               </View>
            </View>

            <View className="gap-3">
               <Pressable onPress={() => {}}>
                  <Text style={styles.forgotPasswordText}>
                     ¿Has olvidado tu contrasena?
                  </Text>
               </Pressable>

               <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Entrar al panel
               </Button>

               <Button
                  mode="outlined"
                  onPress={() => {}}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Continuar con Google
               </Button>
            </View>
         </AuthCard>
      </AuthScreen>
   );
};

const styles = StyleSheet.create({
   button: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 54,
   },
   buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
   },
   forgotPasswordText: {
      color: VIEW_COLORS.onDark,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'right',
   },
   inputOutline: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   input: {
      backgroundColor: AUTH_INPUT_BACKGROUND,
   },
   inputContent: {
      paddingHorizontal: 4,
   },
});

export default memo(LoginView);
