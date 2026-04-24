import { router } from 'expo-router';
import { ProtectedScreen } from '@/components/layout/ProtectedScreen';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, IconButton, MD3Colors, Text } from 'react-native-paper';
import { useProfileQuery } from '@/features/profile/queries/use-profile-query';

export default function ProfileScreen() {
   const { data: profile, isLoading } = useProfileQuery();

   // Si se está cargando el perfil, mostrar una pantalla de carga
   if (isLoading) {
      return (
         <View style={styles.loading}>
            <ActivityIndicator />
            <Text variant="bodyMedium">Cargando perfil...</Text>
         </View>
      );
   }

   return (
      <ProtectedScreen style={styles.safeArea}>
         <View style={styles.row}>
            <Avatar.Text
               label={profile?.username?.at(0)?.toUpperCase() ?? ''}
               size={80}
               color={MD3Colors.primary0}
            />
            
            <View className="block" style={styles.infoUser}>
               <View className="flex-row">
                  <Text style={[styles.text, {marginTop: 12}]}>{profile?.username ?? profile?.email}</Text>
                  <IconButton
                     icon="pencil"
                     size={18}
                     style={styles.iconButton}
                     onPress={() => router.push('/(protected)/profile/edit')}
                  />
               </View>
               <View className="gap-4" style={styles.listInfoUser}>
                  <View>
                     <Text style={styles.text}>Entrenos</Text>
                     <Text style={styles.text}>0</Text>
                  </View>
                  <View>
                     <Text style={styles.text}>Seguidos</Text>
                     <Text style={styles.text}>0</Text>
                  </View>
                  <View>
                     <Text style={styles.text}>Seguidores</Text>
                     <Text style={styles.text}>0</Text>
                  </View>
               </View>
            </View>
         </View>
      </ProtectedScreen>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
   },
   row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
   },
   avatar: {
      margin: 8,
   },
   text: {
      margin: 0,
   },
   infoUser: {
      margin: 24,
   },
   listInfoUser: {
      marginTop: 8,
      flexDirection: 'row',
   },
   iconButton: {
      marginLeft: 8,
   },
   loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingTop: 48,
   },
});