import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { useRef } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useEdit } from '@/features/profile/hooks/use-edit';

export default function ProfileScreen() {
   // Ref para controlar el scroll del KeyboardAwareScrollView desde el componente Screen
   const scrollRef = useRef<KeyboardAwareScrollView>(null);

   // Hook para cerrar sesión del usuario
   const { handleLogout, isLoggingOut } = useEdit();

   // Si se está cerrando sesión, mostrar una pantalla de carga
   if (isLoggingOut) {
      return (
         <View style={styles.loading}>
            <ActivityIndicator />
            <Text variant="bodyMedium">Cerrando sesión...</Text>
         </View>
      );
   }

   return (
      <Screen scrollRef={scrollRef}>
         <List.Section>
            <List.Subheader>Cuenta</List.Subheader>
            <List.Item 
               title="Datos personales" 
               left={(props) => <List.Icon {...props} icon="account"/>} 
               onPress={() => router.push('/(protected)/profile/personal-data')}
            />
            <List.Item 
               title="Objetivos" 
               left={(props) => <List.Icon {...props} icon="target" />} 
            />
            <List.Item 
               title="Cerrar sesión" 
               left={(props) => <List.Icon {...props} icon="logout" />} 
               onPress={() => handleLogout()}
               disabled={isLoggingOut}
            />
         </List.Section>
      </Screen>
   );
}

const styles = StyleSheet.create({
   loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingTop: 48,
   },
});