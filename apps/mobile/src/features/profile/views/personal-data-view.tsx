import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller } from 'react-hook-form';
import {
   ActivityIndicator,
   Avatar,
   HelperText,
   MD3Colors,
   Text,
   TextInput,
} from 'react-native-paper';

import { usePersonalDataForm } from '../hooks/use-personal-data-form';

interface PersonalDataViewProps {
   form: ReturnType<typeof usePersonalDataForm>;
}

const PersonalDataView = ({ form }: PersonalDataViewProps) => {
   if (form.isLoading) {
      return (
         <View style={styles.loading}>
            <ActivityIndicator />
            <Text variant="bodyMedium">Cargando perfil...</Text>
         </View>
      );
   }

   return (
      <View>
         <View className="block" style={styles.avatar}>
            <Avatar.Text label="GA" size={80} color={MD3Colors.primary0} />
         </View>

         <View className="gap-4" style={styles.infoUser}>
            <View>
               <Controller
                  control={form.control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                     <TextInput
                        mode="outlined"
                        label="Nombre"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="words"
                        error={Boolean(form.errors.firstName)}
                        contentStyle={[
                           styles.inputContent,
                           styles.inputWithoutIconContent,
                        ]}
                        outlineStyle={styles.inputOutline}
                     />
                  )}
               />
               <HelperText type="error" visible={Boolean(form.errors.firstName)}>
                  {form.errors.firstName?.message}
               </HelperText>
            </View>

            <View>
               <Controller
                  control={form.control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                     <TextInput
                        mode="outlined"
                        label="Apellidos"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="words"
                        error={Boolean(form.errors.lastName)}
                        contentStyle={[
                           styles.inputContent,
                           styles.inputWithoutIconContent,
                        ]}
                        outlineStyle={styles.inputOutline}
                     />
                  )}
               />
               <HelperText type="error" visible={Boolean(form.errors.lastName)}>
                  {form.errors.lastName?.message}
               </HelperText>
            </View>

            <View>
               <Controller
                  control={form.control}
                  name="birthDate"
                  render={({ field: { onChange, value } }) => (
                     <TextInput
                        mode="outlined"
                        label="Fecha de nacimiento"
                        value={value}
                        onChangeText={onChange}
                        placeholder="1995-06-30"
                        autoCapitalize="none"
                        error={Boolean(form.errors.birthDate)}
                        contentStyle={styles.inputContent}
                        outlineStyle={styles.inputOutline}
                     />
                  )}
               />
               <HelperText type="error" visible={Boolean(form.errors.birthDate)}>
                  {form.errors.birthDate?.message}
               </HelperText>
            </View>

            <View>
               <Controller
                  control={form.control}
                  name="weightKg"
                  render={({ field: { onChange, value } }) => (
                     <TextInput
                        mode="outlined"
                        label="Peso actual (kg)"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="decimal-pad"
                        error={Boolean(form.errors.weightKg)}
                        contentStyle={styles.inputContent}
                        outlineStyle={styles.inputOutline}
                     />
                  )}
               />
               <HelperText type="error" visible={Boolean(form.errors.weightKg)}>
                  {form.errors.weightKg?.message}
               </HelperText>
            </View>

            <View>
               <Controller
                  control={form.control}
                  name="heightCm"
                  render={({ field: { onChange, value } }) => (
                     <TextInput
                        mode="outlined"
                        label="Altura (cm)"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        error={Boolean(form.errors.heightCm)}
                        contentStyle={styles.inputContent}
                        outlineStyle={styles.inputOutline}
                     />
                  )}
               />
               <HelperText type="error" visible={Boolean(form.errors.heightCm)}>
                  {form.errors.heightCm?.message}
               </HelperText>
            </View>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   inputOutline: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   inputContent: {
      paddingRight: 16,
   },
   inputWithoutIconContent: {
      paddingLeft: 16,
   },
   infoUser: {
      marginTop: 24,
   },
   avatar: {
      marginTop: 24,
      alignItems: 'center',
   },
   loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingTop: 48,
   },
});

export default memo(PersonalDataView);
