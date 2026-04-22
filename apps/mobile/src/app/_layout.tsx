import '../../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { buildNavigationTheme, buildPaperTheme } from '@/theme';

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<PaperProvider theme={buildPaperTheme(isDark)}>
			<ThemeProvider value={buildNavigationTheme(isDark)}>
				<Stack
					screenOptions={{
						headerShown: false,
						animation: 'fade',
						contentStyle: {
							backgroundColor: isDark ? '#020617' : '#f8fafc',
						},
					}}
				/>
			</ThemeProvider>
		</PaperProvider>
	);
}
