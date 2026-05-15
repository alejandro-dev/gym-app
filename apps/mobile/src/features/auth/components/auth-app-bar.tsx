import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthAppBarProps {
   title: string;
   align?: 'center' | 'start';
   titleSize?: number;
}

export function AuthAppBar({
   title,
   align = 'center',
   titleSize = 18,
}: AuthAppBarProps) {
   return (
      <View style={[styles.container, align === 'start' && styles.containerStart]}>
         <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={10}
            onPress={() => {
               if (router.canGoBack()) {
                  router.back();
                  return;
               }

               router.replace('/');
            }}
            style={styles.backButton}
         >
            <MaterialDesignIcons name="arrow-left" color={AUTH_COLORS.text} size={22} />
         </Pressable>

         <Text
            numberOfLines={1}
            style={[
               styles.title,
               { fontSize: titleSize },
               align === 'start' && styles.titleStart,
            ]}
         >
            {title}
         </Text>

         <View style={styles.spacer} />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 52,
      justifyContent: 'space-between',
      width: '100%',
   },
   containerStart: {
      gap: 12,
      justifyContent: 'flex-start',
   },
   backButton: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.field,
      borderRadius: 22,
      height: 44,
      justifyContent: 'center',
      width: 44,
   },
   spacer: {
      height: 44,
      width: 44,
   },
   title: {
      color: AUTH_COLORS.text,
      fontSize: 18,
      fontWeight: '700',
   },
   titleStart: {
      flex: 1,
      fontWeight: '800',
   },
});
