import { ProtectedScreen } from "@/components/layout/ProtectedScreen";
import CompletedWorkoutDetailView from "@/features/home/views/completed-workout-detail-view";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export default function CompletedWorkoutDetailScreen() {
	const theme = useTheme();

	return (
		<ProtectedScreen
			edges={["left", "right"]}
			style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
		>
			<CompletedWorkoutDetailView />
		</ProtectedScreen>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
});
