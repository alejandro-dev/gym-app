import { Stack } from 'expo-router';

export default function ProtectedLayout() {
	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="profile/edit"
				options={{ headerShown: true, title: 'Editar perfil' }}
			/>
			<Stack.Screen
				name="profile/personal-data"
				options={{ headerShown: true, title: 'Datos personales' }}
			/>
		</Stack>
	);
}
