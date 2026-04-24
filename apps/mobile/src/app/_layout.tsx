import '../../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { QueryProvider } from '@/components/query-provider';
import { buildNavigationTheme, buildPaperTheme } from '@/theme';
import { getAppBackground } from '@/theme/colors';


export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<PaperProvider theme={buildPaperTheme(isDark)}>
			<QueryProvider>
				<ThemeProvider value={buildNavigationTheme(isDark)}>
					<Stack
						screenOptions={{
							headerShown: false,
							animation: 'fade',
							contentStyle: {
								backgroundColor: getAppBackground(isDark),
							},
						}}
					/>
				</ThemeProvider>
			</QueryProvider>
		</PaperProvider>
	);
}
