import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ProtectedScreenProps {
   children: ReactNode;
   style?: StyleProp<ViewStyle>;
   edges?: Edge[];
}

export function ProtectedScreen({
   children,
   style,
   edges = ['top', 'left', 'right'],
}: ProtectedScreenProps) {
   return (
      <SafeAreaView
         edges={edges}
         style={[styles.screen, style]}
      >
         {children}
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   screen: {
      flex: 1,
      paddingHorizontal: 20,
   },
});
