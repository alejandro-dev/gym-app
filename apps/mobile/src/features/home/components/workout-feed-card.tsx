import { Pressable, View, StyleSheet } from "react-native";
import { Appbar, Avatar, Text, Tooltip } from "react-native-paper";
import { router } from "expo-router";
import WorkoutExerciseRow from "./workout-exercise-row";
import { VIEW_COLORS } from "@/theme/colors";
import type { WorkoutSessionFeedItem } from "@gym-app/types";
import {
	formatDuration,
	formatSessionTimeAgo,
	formatVolume,
} from "../utils/utils";
import { useProfileQuery } from "@/features/profile/queries/use-profile-query";

type WorkoutFeedCardProps = {
	item: WorkoutSessionFeedItem;
	showSeparator: boolean;
	onOpenOptions: () => void;
};

export default function WorkoutFeedCard({
	item,
	showSeparator,
	onOpenOptions,
}: WorkoutFeedCardProps) {
	// Consultamos el perfil del usuario para mostrar su nombre en la tarjeta
	const { data: profile } = useProfileQuery();

	// Evento que se lanza cuando se pulsa sobre la tarjeta de la sesion de entrenamiento completada.
	const handleOpenDetail = () => {
		router.push({
			pathname: "/(protected)/workout-sessions/[id]",
			params: { id: item.id },
		});
	};

	return (
		<View style={styles.feedItem}>
			<View style={styles.authorRow}>
				<Avatar.Text
					size={48}
					label={profile?.username?.at(0)?.toUpperCase() ?? ""}
					labelStyle={styles.avatarLabel}
				/>
				<View style={styles.authorCopy}>
					<Text style={styles.author}>{profile?.username ?? ""}</Text>
					<Text variant="bodyMedium" style={styles.timeAgo}>
						{formatSessionTimeAgo(item.endedAt)}
					</Text>
				</View>
				<Tooltip title="Opciones">
					<Appbar.Action
						icon="dots-horizontal"
						onPress={() => onOpenOptions()}
					/>
				</Tooltip>
			</View>

			<Pressable onPress={handleOpenDetail}>
				<Text variant="titleLarge" style={styles.workoutTitle}>
					{item.name}
				</Text>

				<View style={styles.statsRow}>
					<View style={styles.stat}>
						<Text variant="bodyMedium" style={styles.statLabel}>
							Tiempo
						</Text>
						<Text variant="titleLarge" style={styles.statValue}>
							{formatDuration(item.durationSeconds)}
						</Text>
					</View>
					<View style={styles.stat}>
						<Text variant="bodyMedium" style={styles.statLabel}>
							Volumen
						</Text>
						<Text variant="titleLarge" style={styles.statValue}>
							{formatVolume(item.volumeKg)}
						</Text>
					</View>
				</View>

				<View style={styles.exerciseList}>
					{item.exercises.map((exercise) => (
						<WorkoutExerciseRow key={exercise.id} exercise={exercise} />
					))}
				</View>
			</Pressable>

			{showSeparator ? <View style={styles.separator} /> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	workoutTitle: {
		color: VIEW_COLORS.onDark,
		fontSize: 20,
		fontWeight: "800",
		letterSpacing: 0,
		lineHeight: 30,
		marginTop: 22,
	},
	statsRow: {
		flexDirection: "row",
		gap: 38,
		marginTop: 18,
	},
	feedItem: {
		paddingTop: 22,
	},
	authorRow: {
		alignItems: "center",
		flexDirection: "row",
		gap: 12,
	},
	avatarLabel: {
		color: "#171717",
		fontSize: 28,
		fontWeight: "500",
	},
	authorCopy: {
		flex: 1,
		gap: 2,
	},
	author: {
		color: VIEW_COLORS.onDark,
		fontSize: 15,
		fontWeight: "500",
		lineHeight: 25,
	},
	timeAgo: {
		color: VIEW_COLORS.subtle,
		fontSize: 12,
		lineHeight: 20,
	},
	moreButton: {
		margin: 0,
	},
	stat: {
		gap: 4,
	},
	statLabel: {
		color: VIEW_COLORS.subtle,
		fontSize: 12,
		lineHeight: 19,
	},
	statValue: {
		color: VIEW_COLORS.onDark,
		fontSize: 18,
		fontWeight: "400",
		lineHeight: 26,
	},
	exerciseList: {
		gap: 14,
		marginTop: 28,
	},
	moreExercisesButton: {
		alignSelf: "center",
		borderRadius: 18,
		marginTop: 14,
		overflow: "hidden",
		paddingHorizontal: 14,
		paddingVertical: 6,
	},
	moreExercisesText: {
		color: VIEW_COLORS.subtle,
		fontSize: 16,
		fontWeight: "600",
		lineHeight: 22,
	},
	separator: {
		backgroundColor: "#1F1F1F",
		height: StyleSheet.hairlineWidth,
		marginTop: 14,
	},
});
