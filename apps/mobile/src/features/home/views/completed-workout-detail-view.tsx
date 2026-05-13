import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Avatar, Text, useTheme, type MD3Theme } from "react-native-paper";
import {
	getMuscleGroupLabelEs,
	type MuscleGroup,
	type WorkoutSessionFeedExercise,
} from "@gym-app/types";

import { useProfileQuery } from "@/features/profile/queries/use-profile-query";
import { resolveApiImageUrl } from "@/services/api/media";
import { VIEW_COLORS } from "@/theme/colors";
import { formatDuration, formatVolume } from "../utils/utils";
import { useCompletedWorkoutSessionQuery } from "../queries/use-workout-session-query";
import { StatBlock } from "@/components/ui/StatBlock";

type MuscleShare = {
	muscleGroup: MuscleGroup;
	label: string;
	percentage: number;
};

export default function CompletedWorkoutDetailView() {
	const theme = useTheme();
	const styles = getStyles(theme);

	// Obtenemos los parámetros de la URL
	const params = useLocalSearchParams<{ id?: string }>();
	const sessionId = typeof params.id === "string" ? params.id : "";


	const [showAllMuscles, setShowAllMuscles] = useState(false);

	// Obtenemos el perfil del usuario
	const { data: profile } = useProfileQuery();

	// Obtenemos la sesion de entrenamiento
	const sessionQuery = useCompletedWorkoutSessionQuery(sessionId);
	const session = sessionQuery.data ?? null;

	// Obtenemos el total de series de ejercicios
	const totalSets = useMemo(
		() => session?.exercises.reduce((total, exercise) => total + exercise.sets, 0) ?? 0,
		[session?.exercises],
	);

	// Obtenemos la distribución de muscular
	const muscleShares = useMemo<MuscleShare[]>(() => {
		if (!session || totalSets === 0) return [];

		const setsByMuscle = new Map<MuscleGroup, number>();
		for (const exercise of session.exercises) {
			setsByMuscle.set(
				exercise.muscleGroup,
				(setsByMuscle.get(exercise.muscleGroup) ?? 0) + exercise.sets,
			);
		}

		return Array.from(setsByMuscle.entries())
			.map(([muscleGroup, sets]) => ({
				muscleGroup,
				label: getMuscleGroupLabelEs(muscleGroup),
				percentage: Math.round((sets / totalSets) * 100),
			}))
			.sort((current, next) => next.percentage - current.percentage);
	}, [session, totalSets]);

	// Obtenemos las musculares visibles
	const visibleMuscles = showAllMuscles ? muscleShares : muscleShares.slice(0, 4);

	// Si se está cargando la sesión de entrenamiento, mostramos un indicador de carga.
	if (sessionQuery.isLoading) {
		return (
			<View style={styles.centerState}>
				<ActivityIndicator />
				<Text style={styles.stateText}>Cargando entrenamiento...</Text>
			</View>
		);
	}

	// Si se produjo un error al cargar la sesión de entrenamiento, mostramos un mensaje de error.
	if (sessionQuery.isError || !session) {
		return (
			<View style={styles.centerState}>
				<Text variant="titleMedium" style={styles.stateTitle}>
					No se pudo cargar el entrenamiento.
				</Text>
				<Text style={styles.stateText}>Vuelve al inicio e intentalo de nuevo.</Text>
			</View>
		);
	}

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.content}
		>
			<View style={styles.authorRow}>
				<Avatar.Text
					size={48}
					label={profile?.username?.at(0)?.toUpperCase() ?? ""}
					labelStyle={styles.avatarLabel}
				/>
				<View style={styles.authorCopy}>
					<Text style={styles.author}>{profile?.username ?? ""}</Text>
					<Text variant="bodyMedium" style={styles.dateText}>
						{formatSessionDate(session.endedAt)}
					</Text>
				</View>
			</View>

			<Text variant="titleLarge" style={styles.workoutTitle}>
				{session.name}
			</Text>

			<View style={styles.statsRow}>
				<StatBlock label="Tiempo" value={formatDuration(session.durationSeconds)} />
				<StatBlock label="Volumen" value={formatVolume(session.volumeKg)} />
				<StatBlock label="Series" value={String(totalSets)} />
			</View>

			<View style={styles.separator} />

			<View style={styles.section}>
				<Text variant="titleMedium" style={styles.sectionTitle}>
					Division Muscular
				</Text>
				<View style={styles.muscleList}>
					{visibleMuscles.map((muscle) => (
						<View key={muscle.muscleGroup} style={styles.muscleItem}>
							<Text style={styles.muscleLabel}>{muscle.label}</Text>
							<View style={styles.barRow}>
								<View style={styles.barTrack}>
									<View
										style={[
											styles.barFill,
											{ width: `${Math.max(muscle.percentage, 4)}%` },
										]}
									/>
								</View>
								<Text style={styles.percentageText}>{muscle.percentage}%</Text>
							</View>
						</View>
					))}
				</View>
				{muscleShares.length > 4 ? (
					<Pressable onPress={() => setShowAllMuscles((current) => !current)}>
						<Text style={styles.linkText}>
							{showAllMuscles ? "Mostrar menos" : "Mostrar mas"}
						</Text>
					</Pressable>
				) : null}
			</View>

			<View style={styles.section}>
				<Text variant="titleMedium" style={styles.sectionTitle}>
					Entrenamiento
				</Text>
				<View style={styles.exerciseList}>
					{session.exercises.map((exercise) => (
						<CompletedExerciseItem key={exercise.id} exercise={exercise} />
					))}
				</View>
			</View>
		</ScrollView>
	);
}

function CompletedExerciseItem({
	exercise,
}: {
	exercise: WorkoutSessionFeedExercise;
}) {
	const styles = getStyles(useTheme());
	const imageUri = resolveApiImageUrl(exercise.imageUrl);

	// Evento que se lanza cuando se presiona sobre el componente de la información del ejercicio.
	const handlePressExercise = () => {
		router.push({
			pathname: "/(protected)/exercises/[id]",
			params: { id: exercise.id },
		});
	};

	return (
		<View style={styles.exerciseBlock}>
			<Pressable onPress={handlePressExercise} style={styles.exerciseHeader}>
				<View style={styles.thumbnail}>
					{imageUri ? (
						<Image
							source={{ uri: imageUri }}
							style={styles.thumbnailImage}
							contentFit="cover"
						/>
					) : (
						<Text style={styles.thumbnailText}>
							{exercise.name.slice(0, 2).toUpperCase()}
						</Text>
					)}
				</View>
				<Text variant="titleMedium" style={styles.exerciseName}>
					{exercise.name}
				</Text>
			</Pressable>

			<View style={styles.tableHeader}>
				<Text style={styles.tableHeaderText}>SERIE</Text>
				<Text style={styles.tableHeaderText}>REPS</Text>
			</View>
			{exercise.completedSets.map((set) => (
				<View key={`${exercise.id}-${set.setNumber}`} style={styles.setRow}>
					<Text style={styles.setValue}>{set.setNumber}</Text>
					<Text style={styles.setValue}>{set.reps ?? "-"}</Text>
				</View>
			))}
		</View>
	);
}

// Función que formatea la fecha de la sesión de entrenamiento.
function formatSessionDate(endedAt: string) {
	const date = new Date(endedAt);
	return new Intl.DateTimeFormat("es-ES", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

const getStyles = (theme: MD3Theme) =>
	StyleSheet.create({
		content: {
			paddingTop: 22,
			paddingBottom: 48,
		},
		centerState: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			padding: 24,
			gap: 10,
		},
		stateTitle: {
			color: theme.colors.onBackground,
			fontWeight: "800",
			textAlign: "center",
		},
		stateText: {
			color: VIEW_COLORS.muted,
			textAlign: "center",
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
			color: theme.colors.onBackground,
			fontSize: 15,
			fontWeight: "500",
			lineHeight: 25,
		},
		dateText: {
			color: VIEW_COLORS.subtle,
			fontSize: 12,
			lineHeight: 20,
		},
		workoutTitle: {
			color: theme.colors.onBackground,
			fontSize: 20,
			fontWeight: "800",
			letterSpacing: 0,
			lineHeight: 30,
			marginTop: 28,
		},
		statsRow: {
			flexDirection: "row",
			gap: 38,
			marginTop: 18,
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
			color: theme.colors.onBackground,
			fontSize: 18,
			fontWeight: "400",
			lineHeight: 26,
		},
		separator: {
			backgroundColor: "#1F1F1F",
			height: StyleSheet.hairlineWidth,
			marginTop: 28,
		},
		section: {
			marginTop: 28,
		},
		sectionTitle: {
			color: VIEW_COLORS.subtle,
			fontSize: 18,
			fontWeight: "400",
			lineHeight: 26,
		},
		muscleList: {
			gap: 18,
			marginTop: 22,
		},
		muscleItem: {
			gap: 10,
		},
		muscleLabel: {
			color: theme.colors.onBackground,
			fontSize: 18,
			lineHeight: 24,
		},
		barRow: {
			alignItems: "center",
			flexDirection: "row",
			gap: 10,
		},
		barTrack: {
			flex: 1,
			height: 22,
		},
		barFill: {
			backgroundColor: theme.colors.primary,
			borderRadius: 4,
			height: 22,
		},
		percentageText: {
			color: VIEW_COLORS.subtle,
			fontSize: 18,
			lineHeight: 24,
			minWidth: 46,
		},
		linkText: {
			color: theme.colors.primary,
			fontSize: 18,
			lineHeight: 24,
			marginTop: 18,
		},
		exerciseList: {
			gap: 28,
			marginTop: 22,
		},
		exerciseBlock: {
			gap: 18,
		},
		exerciseHeader: {
			alignItems: "center",
			flexDirection: "row",
			gap: 18,
			minHeight: 52,
		},
		thumbnail: {
			alignItems: "center",
			backgroundColor: VIEW_COLORS.mediaPlaceholder,
			borderRadius: 24,
			height: 48,
			justifyContent: "center",
			overflow: "hidden",
			width: 48,
		},
		thumbnailImage: {
			height: "100%",
			width: "100%",
		},
		thumbnailText: {
			color: "#171717",
			fontWeight: "900",
		},
		exerciseName: {
			color: theme.colors.primary,
			flex: 1,
			fontSize: 18,
			fontWeight: "800",
			letterSpacing: 0,
			lineHeight: 24,
		},
		tableHeader: {
			flexDirection: "row",
			gap: 42,
			paddingLeft: 6,
		},
		tableHeaderText: {
			color: VIEW_COLORS.subtle,
			fontSize: 14,
			letterSpacing: 0,
			lineHeight: 20,
		},
		setRow: {
			flexDirection: "row",
			gap: 68,
			paddingLeft: 14,
		},
		setValue: {
			color: theme.colors.onBackground,
			fontSize: 16,
			lineHeight: 22,
		},
	});
