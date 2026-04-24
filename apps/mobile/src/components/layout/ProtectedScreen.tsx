import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProtectedScreenProps {
   children: ReactNode;
   style?: StyleProp<ViewStyle>;
}

export function ProtectedScreen({ children, style }: ProtectedScreenProps) {
   return (
      <SafeAreaView
         edges={['top', 'left', 'right']}
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