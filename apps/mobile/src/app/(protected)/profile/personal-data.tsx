import { Stack } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import PersonalDataView from '@/features/profile/views/personal-data-view';
import { useRef } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { usePersonalDataForm } from '@/features/profile/hooks/use-personal-data-form';

export default function PersonalDataScreen() {
   // Ref para controlar el scroll del KeyboardAwareScrollView desde el componente Screen
   const scrollRef = useRef<KeyboardAwareScrollView>(null);

   // Formulario para actualizar los datos personales del usuario
   const form = usePersonalDataForm();

   return (
      <>
         <Screen scrollRef={scrollRef}>
            <PersonalDataView form={form} />
         </Screen>
      </>
   );
}