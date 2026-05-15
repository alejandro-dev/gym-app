import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthFooterPrompt } from '@/features/auth/components/AuthFooterPrompt';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { AUTH_INPUT_BACKGROUND, AUTH_INPUT_PROPS } from '@/features/auth/constants/auth-input';
import useForgotPasswordView from '@/features/auth/hooks/use-forgot-password-view';
import { VIEW_COLORS } from '@/theme/colors';
import { router } from 'expo-router';

const ForgotPasswordView = () => {
   const { control, errors, isSubmitting, handleForgotPassword } =
      useForgotPasswordView();

   return (
      <AuthScreen
         footer={
            <AuthFooterPrompt
               prompt="¿Ya recordaste tu contrasena?"
               actionLabel="Iniciar sesion"
               onPress={() => {
                  router.navigate('/login');
               }}
            />
         }
      >
         <AuthCard
            title="Restablece tu contrasena"
            description="Introduce tu email y te enviaremos instrucciones para crear una nueva contrasena."
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

               <Button
                  mode="contained"
                  onPress={handleForgotPassword}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Enviar instrucciones
               </Button>
            </View>
         </AuthCard>
      </AuthScreen>
   );
};

export default ForgotPasswordView;

const styles = StyleSheet.create({
   input: {
      backgroundColor: AUTH_INPUT_BACKGROUND,
   },
   inputContent: {
      color: VIEW_COLORS.text,
   },
   inputOutline: {
      borderRadius: 18,
      borderWidth: 1,
   },
   button: {
      borderRadius: 999,
      backgroundColor: '#ffffff',
   },
   buttonContent: {
      height: 54,
   },
   buttonLabel: {
      color: '#111111',
      fontWeight: '700',
      fontSize: 16,
   },
});
