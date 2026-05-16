import type { WorkoutSessionFeedItem } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useProfileQuery } from '@/features/profile/queries/use-profile-query';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import {
	formatCompactVolume,
	formatDuration,
	formatSessionTimeAgo,
} from '../utils/utils';

type WorkoutFeedCardProps = {
	item: WorkoutSessionFeedItem;
	onOpenOptions: (workoutSession: WorkoutSessionFeedItem) => void;
	isCompact?: boolean;
};

export default function WorkoutFeedCard({
	item,
	onOpenOptions,
	isCompact = false,
}: WorkoutFeedCardProps) {
	// Consultamos el perfil del usuario para mostrar su nombre en la tarjeta
	const { data: profile } = useProfileQuery();
	const completedSets = item.exercises.reduce(
		(accumulator, exercise) => accumulator + exercise.completedSets.length,
		0,
	);
	const exerciseNames = item.exercises.slice(0, 2).map((exercise) => exercise.name);
	const remainingExercises = Math.max(0, item.exercises.length - exerciseNames.length);
	const avatarLetter = profile?.username?.at(0)?.toUpperCase() ?? 'A';

	// Evento que se lanza cuando se pulsa sobre la tarjeta de la sesion de entrenamiento completada.
	const handleOpenDetail = () => {
		router.push({
			pathname: "/(protected)/workout-sessions/[id]",
			params: { id: item.id },
		});
	};

	if (isCompact) {
		return (
			<Pressable onPress={handleOpenDetail} style={styles.compactCard}>
				<View style={styles.authorRow}>
					<Text style={styles.compactTitle}>{item.name}</Text>
					<Pressable
						accessibilityLabel="Opciones"
						hitSlop={8}
						onPress={() => onOpenOptions(item)}
						style={styles.moreButton}
					>
						<MaterialDesignIcons color="#9EA3AD" name="dots-horizontal" size={22} />
					</Pressable>
				</View>
				<Text style={styles.compactMeta}>
					{`${formatSessionTimeAgo(item.endedAt)} · ${formatDuration(item.durationSeconds)} · ${formatCompactVolume(item.volumeKg)} kg · ${completedSets} series`}
				</Text>
			</Pressable>
		);
	}

	return (
		<View style={styles.feedItem}>
			<View style={styles.authorRow}>
				<View style={styles.avatar}>
					<Text style={styles.avatarLabel}>{avatarLetter}</Text>
				</View>
				<View style={styles.authorCopy}>
					<Text style={styles.author}>{profile?.username ?? ""}</Text>
					<Text style={styles.timeAgo}>
						{formatSessionTimeAgo(item.endedAt)}
					</Text>
				</View>
				<Pressable
					accessibilityLabel="Opciones"
					hitSlop={8}
					onPress={() => onOpenOptions(item)}
					style={styles.moreButton}
				>
					<MaterialDesignIcons color="#9EA3AD" name="dots-horizontal" size={22} />
				</Pressable>
			</View>

			<Pressable onPress={handleOpenDetail}>
				<Text style={styles.workoutTitle}>
					{item.name}
				</Text>

				<View style={styles.statsRow}>
					<View style={styles.stat}>
						<Text style={styles.statLabel}>
							Tiempo
						</Text>
						<Text style={styles.statValue}>
							{formatDuration(item.durationSeconds)}
						</Text>
					</View>
					<View style={styles.stat}>
						<Text style={styles.statLabel}>
							Volumen
						</Text>
						<Text style={styles.statValue}>
							{formatCompactVolume(item.volumeKg)} kg
						</Text>
					</View>
				</View>

				<View style={styles.exerciseChips}>
					{exerciseNames.map((exerciseName) => (
						<View key={exerciseName} style={styles.exerciseChip}>
							<Text style={styles.exerciseChipText}>{exerciseName}</Text>
						</View>
					))}
					{remainingExercises > 0 ? (
						<View style={styles.exerciseChip}>
							<Text style={styles.exerciseChipText}>{`+${remainingExercises}`}</Text>
						</View>
					) : null}
				</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	author: {
		color: VIEW_COLORS.onDark,
		fontSize: 15,
		fontWeight: '500',
		lineHeight: 20,
	},
	authorCopy: {
		flex: 1,
		gap: 1,
	},
	authorRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10,
	},
	avatar: {
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 19,
		height: 38,
		justifyContent: 'center',
		width: 38,
	},
	avatarLabel: {
		color: AUTH_COLORS.primaryForeground,
		fontSize: 16,
		fontWeight: '700',
	},
	compactCard: {
		backgroundColor: '#181A20',
		borderColor: '#2A2E36',
		borderRadius: 18,
		borderWidth: 1,
		gap: 8,
		padding: 14,
	},
	compactMeta: {
		color: '#9EA3AD',
		fontSize: 12,
		lineHeight: 18,
	},
	compactTitle: {
		color: VIEW_COLORS.onDark,
		fontSize: 16,
		fontWeight: '800',
		flex: 1,
	},
	exerciseChip: {
		backgroundColor: '#211F26',
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
	exerciseChipText: {
		color: VIEW_COLORS.onDark,
		fontSize: 12,
		fontWeight: '600',
	},
	exerciseChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 10,
	},
	feedItem: {
		backgroundColor: AUTH_COLORS.elevatedSurface,
		borderColor: AUTH_COLORS.elevatedOutline,
		borderRadius: 18,
		borderWidth: 1,
		gap: 10,
		padding: 14,
	},
	moreButton: {
		alignItems: 'center',
		height: 22,
		justifyContent: 'center',
		width: 22,
	},
	stat: {
		flex: 1,
		gap: 2,
	},
	statLabel: {
		color: '#9EA3AD',
		fontSize: 11,
	},
	statValue: {
		color: VIEW_COLORS.onDark,
		fontFamily: 'monospace',
		fontSize: 18,
		fontWeight: '800',
	},
	statsRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 10,
	},
	timeAgo: {
		color: '#9EA3AD',
		fontSize: 12,
		lineHeight: 18,
	},
	workoutTitle: {
		color: VIEW_COLORS.onDark,
		fontSize: 18,
		fontWeight: '800',
		marginTop: 10,
	},
});
