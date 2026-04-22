import React from 'react';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';

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
		<React.Fragment>
			<Text className="text-sm text-slate-600 dark:text-slate-300">{prompt}</Text>
			<Pressable onPress={onPress}>
				<Text className="text-sm font-semibold text-slate-900 dark:text-slate-50">
					{actionLabel}
				</Text>
			</Pressable>
		</React.Fragment>
	);
}
