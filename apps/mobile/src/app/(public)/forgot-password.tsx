import ForgotPasswordView from '@/features/auth/views/forgot-password-view';
import { View } from 'react-native';

export default function ForgotPasswordScreen() {
   return (
      <View className="flex-1 bg-black">
         <ForgotPasswordView />
      </View>
   );
}
