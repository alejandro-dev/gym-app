import { AppBottomTabBar } from '@/components/navigation/AppBottomTabBar';
import { getAppBackground } from '@/theme/colors';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function ProtectedTabsLayout() {
   const colorScheme = useColorScheme();
   const isDark = colorScheme === 'dark';

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            headerTitle: 'Gym App',
            sceneStyle: {
               backgroundColor: getAppBackground(isDark),
            },
         }}
         tabBar={(props) => <AppBottomTabBar {...props} />}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: 'Inicio',
            }}
         />
         <Tabs.Screen
            name="training-sessions/index"
            options={{
               title: 'Rutinas',
            }}
         />
         <Tabs.Screen
            name="profile/index"
            options={{
               title: 'Perfil',
            }}
         />
      </Tabs>
   );
}
