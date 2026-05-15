import LoginView from "@/features/auth/views/login-view";
import { View } from "react-native";
import { AUTH_COLORS } from "@/theme/colors";

export default function LoginScreen() {
	return (
		<View className="flex-1" style={{ backgroundColor: AUTH_COLORS.background }}>
			<LoginView />
		</View>
	);
}
