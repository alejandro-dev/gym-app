import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface AuthCardProps {
	title: string;
	description: string;
	children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Card
			mode="elevated"
			className="rounded-[32px] bg-white dark:bg-slate-900"
			style={isDark ? styles.cardDark : styles.cardLight}
		>
			<Card.Content className="gap-6 p-6">
				<React.Fragment>
					<CardHeader title={title} description={description} />
					{children}
				</React.Fragment>
			</Card.Content>
		</Card>
	);
}

function CardHeader({ title, description }: { title: string; description: string }) {
	return (
		<React.Fragment>
			<Text variant="titleLarge" className="font-semibold text-slate-900 dark:text-slate-50">
				{title}
			</Text>
			<Text className="-mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
				{description}
			</Text>
		</React.Fragment>
	);
}

const styles = StyleSheet.create({
	cardLight: {
		borderRadius: 32,
		borderCurve: 'continuous',
		boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
	},
	cardDark: {
		borderRadius: 32,
		borderCurve: 'continuous',
		boxShadow: '0 16px 36px rgba(0, 0, 0, 0.32)',
	},
});
