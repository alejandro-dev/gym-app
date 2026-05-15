import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { AUTH_COLORS } from '@/theme/colors';

interface AuthFooterPromptProps {
	prompt: string;
	actionLabel: string;
	onPress: () => void;
}

export function AuthFooterPrompt({
	prompt,
	actionLabel,
	onPress,
}: AuthFooterPromptProps) {
	return (
		<Pressable onPress={onPress} style={styles.container}>
			<Text style={styles.prompt}>{prompt}</Text>
			<Text style={styles.action}>
					{actionLabel}
				</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	action: {
		color: AUTH_COLORS.primary,
		fontSize: 14,
		fontWeight: '700',
	},
	container: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4,
		justifyContent: 'center',
		width: '100%',
	},
	prompt: {
		color: AUTH_COLORS.muted,
		fontSize: 14,
	},
});
