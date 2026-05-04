import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface AuthCardProps {
	title: string;
	description: string;
	children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
	return (
		<Card
			mode="elevated"
			className="rounded-[32px] bg-neutral-950"
			style={styles.card}
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
			<Text variant="titleLarge" className="font-semibold text-neutral-50">
				{title}
			</Text>
			<Text className="-mt-4 text-sm leading-6 text-neutral-400">
				{description}
			</Text>
		</React.Fragment>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 32,
		borderCurve: 'continuous',
		backgroundColor: '#171717',
		boxShadow: '0 16px 36px rgba(0, 0, 0, 0.32)',
	},
});
