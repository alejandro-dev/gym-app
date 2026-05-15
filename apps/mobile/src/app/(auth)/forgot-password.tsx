import { View } from 'react-native';

import ForgotPasswordView from '@/features/auth/views/forgot-password-view';
import { AUTH_COLORS } from '@/theme/colors';

export default function ForgotPasswordScreen() {
   return (
      <View className="flex-1" style={{ backgroundColor: AUTH_COLORS.background }}>
         <ForgotPasswordView />
      </View>
   );
}
