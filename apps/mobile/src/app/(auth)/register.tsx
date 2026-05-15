import RegisterView from "@/features/auth/views/register-view";
import { View } from "react-native";
import { AUTH_COLORS } from "@/theme/colors";

export default function RegisterScreen() {
   return (
      <View className="flex-1" style={{ backgroundColor: AUTH_COLORS.background }}>
         <RegisterView />
      </View>
   );
}
