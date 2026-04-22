import RegisterView from "@/features/auth/views/register-view";
import { View } from "react-native";

export default function RegisterScreen() {
   return (
      <View className="flex-1 my-6">
         <RegisterView />
      </View>
   );
}
