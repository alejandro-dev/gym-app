import {
	MD3DarkTheme,
	MD3LightTheme,
	type MD3Theme,
} from 'react-native-paper';
import {
	DarkTheme as NavigationDarkTheme,
	DefaultTheme as NavigationDefaultTheme,
	type Theme as NavigationTheme,
} from '@react-navigation/native';

const palette = {
	light: {
		background: '#f8fafc',
		surface: '#ffffff',
		surfaceVariant: '#e2e8f0',
		primary: '#2563eb',
		onPrimary: '#ffffff',
		text: '#0f172a',
		muted: '#475569',
		border: '#cbd5e1',
		bgButton: '#2563eb',
		textButton: '#ffffff',
	},
	dark: {
		background: '#020617',
		surface: '#0f172a',
		surfaceVariant: '#1e293b',
		primary: '#60a5fa',
		onPrimary: '#0f172a',
		text: '#f8fafc',
		muted: '#cbd5e1',
		border: '#334155',
	},
} as const;

export const APP_COPY = {
	title: 'Gym App Mobile',
	subtitle:
		'Base limpia para empezar el producto con Expo Router, React Native Paper y NativeWind.',
} as const;

export function buildPaperTheme(isDark: boolean): MD3Theme {
	const colors = isDark ? palette.dark : palette.light;
	const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

	return {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			primary: colors.primary,
			onPrimary: colors.onPrimary,
			background: colors.background,
			surface: colors.surface,
			surfaceVariant: colors.surfaceVariant,
			onSurface: colors.text,
			onSurfaceVariant: colors.muted,
			outline: colors.border,
		},
		roundness: 4,
	};
}

export function buildNavigationTheme(isDark: boolean): NavigationTheme {
	const colors = isDark ? palette.dark : palette.light;
	const baseTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

	return {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			background: colors.background,
			card: colors.background,
			primary: colors.primary,
			text: colors.text,
			border: colors.border,
			notification: colors.primary,
		},
	};
}
