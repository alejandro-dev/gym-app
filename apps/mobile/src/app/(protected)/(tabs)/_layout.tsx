import { getAppBackground } from '@/theme/colors';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProtectedTabsLayout() {
   const insets = useSafeAreaInsets();
   const colorScheme = useColorScheme();
   const isDark = colorScheme === 'dark';

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            headerTitle: 'Gym App',
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
               height: 56 + insets.bottom,
               paddingTop: 6,
               paddingBottom: Math.max(insets.bottom, 8),
            },
            sceneStyle: {
               backgroundColor: getAppBackground(isDark),
            },
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: 'Inicio',
               tabBarIcon: ({ color, size }) => (
                  <MaterialDesignIcons name="home-outline" color={color} size={size} />
               ),
            }}
         />
         <Tabs.Screen
            name="training-sessions/index"
            options={{
               title: 'Entrenamientos',
               tabBarIcon: ({ color, size }) => (
                  <MaterialDesignIcons name="dumbbell" color={color} size={size} />
               ),
            }}
         />
         <Tabs.Screen
            name="profile/index"
            options={{
               title: 'Perfil',
               tabBarIcon: ({ color, size }) => (
                  <MaterialDesignIcons name="account-outline" color={color} size={size} />
               ),
            }}
         />
      </Tabs>
   );
}
