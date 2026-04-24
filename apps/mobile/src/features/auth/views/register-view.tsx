import React, { memo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthFooterPrompt } from '@/features/auth/components/AuthFooterPrompt';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import useRegisterView from '@/features/auth/hooks/use-register-view';

const RegisterView = () => {
   const { control, errors, isSubmitting, handleRegister } = useRegisterView();
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const scrollRef = useRef<KeyboardAwareScrollView>(null);

   return (
      <AuthScreen
         scrollRef={scrollRef}
         footer={
            <AuthFooterPrompt
               prompt="Ya tienes cuenta?"
               actionLabel="Iniciar sesion"
               onPress={() => router.navigate('/login')}
            />
         }
      >
         <AuthCard
            title="Crea tu cuenta"
            description="Completa tus datos para empezar a planificar y seguir tu progreso desde el movil."
         >
            <View>
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
                     name="username"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Username"
                           value={value}
                           onChangeText={onChange}
                           autoCapitalize="none"
                           autoComplete="username"
                           error={Boolean(errors.username)}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="account-outline" />}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.username)}>
                     {errors.username?.message}
                  </HelperText>
               </View>

               <View>
                  <Controller
                     control={control}
                     name="birthDate"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Fecha de nacimiento"
                           value={value}
                           onChangeText={onChange}
                           placeholder="1995-06-30"
                           autoCapitalize="none"
                           error={Boolean(errors.birthDate)}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="calendar-month-outline" />}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.birthDate)}>
                     {errors.birthDate?.message}
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

               <View>
                  <Controller
                     control={control}
                     name="confirmPassword"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Confirmar contrasena"
                           value={value}
                           onChangeText={onChange}
                           secureTextEntry={!showConfirmPassword}
                           autoComplete="password"
                           textContentType="password"
                           error={Boolean(errors.confirmPassword)}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="shield-check-outline" />}
                           right={
                              <TextInput.Icon
                                 icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                 onPress={() => setShowConfirmPassword((current) => !current)}
                              />
                           }
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.confirmPassword)}>
                     {errors.confirmPassword?.message}
                  </HelperText>
               </View>

               <View>
                  <Controller
                     control={control}
                     name="firstName"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Nombre"
                           value={value}
                           onChangeText={onChange}
                           autoCapitalize="words"
                           error={Boolean(errors.firstName)}
                           contentStyle={[styles.inputContent, styles.inputWithoutIconContent]}
                           outlineStyle={styles.inputOutline}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.firstName)}>
                     {errors.firstName?.message}
                  </HelperText>

                  <Controller
                     control={control}
                     name="lastName"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Apellidos"
                           value={value}
                           onChangeText={onChange}
                           autoCapitalize="words"
                           error={Boolean(errors.lastName)}
                           contentStyle={[styles.inputContent, styles.inputWithoutIconContent]}
                           outlineStyle={styles.inputOutline}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.lastName)}>
                     {errors.lastName?.message}
                  </HelperText>
               </View>

               <View>
                  <Controller
                     control={control}
                     name="weightKg"
                     render={({ field: { onChange, value } }) => (
                        <TextInput
                           mode="outlined"
                           label="Peso actual (kg)"
                           value={value}
                           onChangeText={onChange}
                           keyboardType="decimal-pad"
                           error={Boolean(errors.weightKg)}
                           contentStyle={styles.inputContent}
                           outlineStyle={styles.inputOutline}
                           left={<TextInput.Icon icon="scale-bathroom" />}
                        />
                     )}
                  />
                  <HelperText type="error" visible={Boolean(errors.weightKg)}>
                     {errors.weightKg?.message}
                  </HelperText>

                  <View>
                     <Controller
                        control={control}
                        name="heightCm"
                        render={({ field: { onChange, value } }) => (
                           <TextInput
                              mode="outlined"
                              label="Altura (cm)"
                              value={value}
                              onChangeText={onChange}
                              keyboardType="number-pad"
                              error={Boolean(errors.heightCm)}
                              contentStyle={styles.inputContent}
                              outlineStyle={styles.inputOutline}
                              left={<TextInput.Icon icon="human-male-height" />}
                           />
                        )}
                     />
                     <HelperText type="error" visible={Boolean(errors.heightCm)}>
                        {errors.heightCm?.message}
                     </HelperText>
                  </View>
               </View>
            </View>

            <View className="gap-3">
               <Button
                  mode="contained"
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
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
   inputWithoutIconContent: {
      paddingLeft: 16,
   },
});

export default memo(RegisterView);
