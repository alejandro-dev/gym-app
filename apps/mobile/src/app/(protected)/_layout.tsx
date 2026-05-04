import { Stack } from 'expo-router';

import { NewRoutineProvider } from '@/features/training-sessions/context/new-routine-context';

export default function ProtectedLayout() {
	return (
		<NewRoutineProvider>
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
				<Stack.Screen
					name="training-sessions/new"
					options={{ headerShown: true, title: 'Nueva rutina' }}
				/>
				<Stack.Screen
					name="training-sessions/new-exercise"
					options={{ headerShown: true, title: 'Añadir ejercicio' }}
				/>
				<Stack.Screen
					name="training-sessions/exercise-picker"
					options={{
						headerShown: true,
						title: 'Agregar ejercicio',
					}}
				/>
				<Stack.Screen
					name="training-sessions/[id]/edit"
					options={{ 
						headerShown: true, 
						title: 'Editar rutina' 
					}}
				/>
				<Stack.Screen
					name="training-sessions/[id]/duplicate"
					options={{
						headerShown: true,
						title: 'Duplicar rutina',
					}}
				/>
			</Stack>
		</NewRoutineProvider>
	);
}
