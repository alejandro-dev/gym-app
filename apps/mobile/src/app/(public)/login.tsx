import LoginView from "@/features/auth/views/login-view";
import { View } from "react-native";

export default function LoginScreen() {
	return (
		<View className="flex-1 bg-black">
			<LoginView />
		</View>
	);
}
