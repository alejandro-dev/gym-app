import { VIEW_COLORS } from "@/theme/colors";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import WorkoutFeedCard from "../components/workout-feed-card";
import { useCompletedWorkoutSessionsQuery } from "../queries/use-workout-session-query";

type HomeViewProps = {
  onOpenWorkoutOptions: () => void;
};

export default function HomeView({ onOpenWorkoutOptions }: HomeViewProps) {
  const { data, isLoading, isError } = useCompletedWorkoutSessionsQuery({
    page: 0,
    limit: 10,
  });

  const feedItems = data?.items ?? [];

  return (
    <>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Inicio
        </Text>
      </View>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feed}
        >
          {isLoading ? (
            <Text style={styles.stateText}>Cargando sesiones...</Text>
          ) : isError ? (
            <Text style={styles.stateText}>
              No se pudieron cargar las sesiones.
            </Text>
          ) : feedItems.length === 0 ? (
            <Text style={styles.stateText}>
              Todavía no tienes sesiones realizadas.
            </Text>
          ) : (
            feedItems.map((item, index) => (
              <WorkoutFeedCard
                key={item.id}
                item={item}
                showSeparator={index < feedItems.length - 1}
                onOpenOptions={onOpenWorkoutOptions}
              />
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: VIEW_COLORS.onDark,
    paddingLeft: 0,
  },
  feed: {
    paddingBottom: 28,
  },
  container: {
    flex: 1,
  },
  button: {
    borderRadius: 18,
    borderCurve: "continuous",
  },
  buttonContent: {
    minHeight: 54,
  },
  buttonLabel: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: VIEW_COLORS.onDark,
    paddingLeft: 0,
  },
  accordion: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  accordionContent: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  accordionTitle: {
    fontSize: 16,
    marginLeft: 0,
  },
  list: {
    gap: 12,
  },
  stateText: {
    color: VIEW_COLORS.muted,
    paddingVertical: 12,
  },
});
