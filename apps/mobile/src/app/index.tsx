import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { AuthHero } from '@/features/auth/components/AuthHero';

export default function HomeScreen() {

	// Ir a la pantalla de login
	const handleLoginPress = () => {
		router.push('/login');
	};

	// Ir a la pantalla de registro
	const handleRegisterPress = () => {
		router.push('/register');
	};

	return (
		<SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 mx-6 gap-6 my-6">
			<AuthHero
				title="Tu centro de control para entrenar mejor."
				description="Accede a atletas, rutinas y progreso desde una experiencia pensada para moverse rapido en movil."
			/>

			<View className="flex-1 gap-3">
				<Button
					mode="contained"
					onPress={handleLoginPress}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonLabel}
					style={styles.button}
				>
					Login
				</Button>

				<Button
					mode="contained"
					onPress={handleRegisterPress}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonLabel}
					style={styles.button}
				>
					Registrarse
				</Button>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 18,
		borderCurve: 'continuous',
	},
	buttonContent: {
		minHeight: 54,
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: '600',
	},
	inputOutline: {
		borderRadius: 18,
		borderCurve: 'continuous',
	},
	inputContent: {
		paddingHorizontal: 4,
	},
});