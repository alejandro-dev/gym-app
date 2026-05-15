import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthSurfaceCardProps {
   children: ReactNode;
}

export function AuthSurfaceCard({ children }: AuthSurfaceCardProps) {
   return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
   card: {
      backgroundColor: AUTH_COLORS.surface,
      borderColor: AUTH_COLORS.outline,
      borderRadius: 16,
      borderWidth: 1,
      gap: 10,
      padding: 16,
      shadowColor: '#000000',
      shadowOffset: {
         width: 0,
         height: 12,
      },
      shadowOpacity: 0.33,
      shadowRadius: 28,
   },
});
