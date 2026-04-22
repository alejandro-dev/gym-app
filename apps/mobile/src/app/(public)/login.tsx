import LoginView from "@/features/auth/views/login-view";
import { View } from "react-native";

export default function LoginScreen() {
	return (
		<View className="flex-1 my-6">
			<LoginView />
		</View>
	);
}
