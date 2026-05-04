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
import { APP_COLORS } from './colors';

const palette = {
	light: {
		background: '#FAFAFA',
		surface: '#ffffff',
		surfaceVariant: '#F5F5F5',
		primary: '#0A0A0A',
		onPrimary: '#ffffff',
		tertiary: APP_COLORS.accent,
		onTertiary: '#052E16',
		text: '#0A0A0A',
		muted: '#737373',
		border: '#E5E5E5',
	},
	dark: {
		background: '#000000',
		surface: '#171717',
		surfaceVariant: '#171717',
		primary: '#FFFFFF',
		onPrimary: '#000000',
		tertiary: APP_COLORS.accent,
		onTertiary: '#052E16',
		text: '#FAFAFA',
		muted: '#A3A3A3',
		border: '#262626',
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
			tertiary: colors.tertiary,
			onTertiary: colors.onTertiary,
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
