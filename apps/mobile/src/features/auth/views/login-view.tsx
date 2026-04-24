import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthFooterPrompt } from '@/features/auth/components/AuthFooterPrompt';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import useLoginView from '@/features/auth/hooks/use-login-view';

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
                           mode="outlined"
                           label="Email"
                           value={value}
                           onChangeText={onChange}
                           autoCapitalize="none"
                           autoComplete="email"
                           keyboardType="email-address"
                           textContentType="emailAddress"
                           error={Boolean(errors.email)}
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
                           mode="outlined"
                           label="Contrasena"
                           value={value}
                           onChangeText={onChange}
                           secureTextEntry={!showPassword}
                           autoComplete="password"
                           textContentType="password"
                           error={Boolean(errors.password)}
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
                  <Text className="text-right text-sm font-medium text-sky-600 dark:text-sky-400">
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
   inputOutline: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   inputContent: {
      paddingHorizontal: 4,
   },
});

export default memo(LoginView);
