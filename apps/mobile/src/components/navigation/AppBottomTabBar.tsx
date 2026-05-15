import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_COLORS } from '@/theme/colors';

const TAB_ICON_NAMES = {
   index: 'home',
   'training-sessions/index': 'dumbbell',
   'profile/index': 'account',
} as const;

const MONO_FONT_FAMILY = Platform.select({
   ios: 'Menlo',
   default: 'monospace',
});

export function AppBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
   const insets = useSafeAreaInsets();

   return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 21) }]}>
         <View style={styles.pill}>
            {state.routes.map((route, index) => {
               const isFocused = state.index === index;
               const { options } = descriptors[route.key];
               const label =
                  typeof options.title === 'string' && options.title.length > 0
                     ? options.title
                     : route.name;

               const onPress = () => {
                  const event = navigation.emit({
                     canPreventDefault: true,
                     target: route.key,
                     type: 'tabPress',
                  });

                  if (!isFocused && !event.defaultPrevented) {
                     navigation.navigate(route.name, route.params);
                  }
               };

               const onLongPress = () => {
                  navigation.emit({
                     target: route.key,
                     type: 'tabLongPress',
                  });
               };

               const iconName = TAB_ICON_NAMES[route.name as keyof typeof TAB_ICON_NAMES] ?? 'circle';
               const iconColor = isFocused
                  ? AUTH_COLORS.primaryForeground
                  : AUTH_COLORS.muted;
               const labelColor = iconColor;

               return (
                  <Pressable
                     key={route.key}
                     accessibilityRole="button"
                     accessibilityState={isFocused ? { selected: true } : {}}
                     onLongPress={onLongPress}
                     onPress={onPress}
                     style={[styles.item, isFocused && styles.itemActive]}
                  >
                     <MaterialDesignIcons color={iconColor} name={iconName} size={18} />
                     <Text style={[styles.label, { color: labelColor }, isFocused && styles.labelActive]}>
                        {label.toUpperCase()}
                     </Text>
                  </Pressable>
               );
            })}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      justifyContent: 'center',
      paddingHorizontal: 21,
      paddingTop: 12,
   },
   item: {
      alignItems: 'center',
      borderRadius: 26,
      flex: 1,
      gap: 4,
      height: '100%',
      justifyContent: 'center',
   },
   itemActive: {
      backgroundColor: AUTH_COLORS.primary,
   },
   label: {
      color: AUTH_COLORS.muted,
      fontFamily: MONO_FONT_FAMILY,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.2,
   },
   labelActive: {
      fontWeight: '800',
   },
   pill: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 36,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 4,
      height: 62,
      padding: 4,
   },
});
