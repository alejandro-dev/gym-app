import { Stack } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Button } from 'react-native-paper';
import PersonalDataView from '@/features/profile/views/personal-data-view';
import { useRef } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { usePersonalDataForm } from '@/features/profile/hooks/use-personal-data-form';
import { StyleSheet } from 'react-native';

export default function PersonalDataScreen() {
   // Ref para controlar el scroll del KeyboardAwareScrollView desde el componente Screen
   const scrollRef = useRef<KeyboardAwareScrollView>(null);

   // Formulario para actualizar los datos personales del usuario
   const form = usePersonalDataForm();

   return (
      <>
         <Stack.Screen
            options={{
               title: 'Datos personales',
               headerRight: () => (
                  <Button
                     mode="contained"
                     onPress={form.handleSave}
                     disabled={form.isSaving}
                     style={styles.button}
                  >
                     {form.isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
               ),
            }}
         />
         <Screen scrollRef={scrollRef}>
            <PersonalDataView form={form} />
         </Screen>
      </>
   );
}

const styles = StyleSheet.create({
   button: {
      borderRadius: 12,
      borderCurve: 'continuous',
   },
});