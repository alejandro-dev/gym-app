import { StatBlock } from "@/components/ui/StatBlock";
import { formatStopwatch, formatVolume } from "@/features/home/utils/utils";
import { WorkoutSession } from "@gym-app/types";
import { ScrollView, StyleSheet, View } from "react-native";
import { MD3Theme, useTheme, Text, Divider, TextInput, Button } from "react-native-paper";

type WorkoutDetailFinishViewProps = {
   workoutSession: WorkoutSession;
   notes: string;
   durationSeconds: number;
   completedSetsCount: number;
   setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
   onNotes: (notes: string) => void;
}

export default function WorkoutDetailFinishView({ workoutSession, notes, durationSeconds, completedSetsCount, setIsDeleteDialogOpen, onNotes }: WorkoutDetailFinishViewProps) {
   const theme = useTheme();
   const styles = getStyles(theme);

   // Evento que se lanza cuando se pulsa el botón de `Descartar entreno`.
   const handleDeleteWorkoutSession = () => {
      setIsDeleteDialogOpen(true);
   }

   // Obtenemos la fecha de inicio de la sesión de entrenamiento.
   const startedAtLabel = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
   }).format(new Date(workoutSession.startedAt));

	return (
		<ScrollView
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.content}
      >
         <Text variant="titleLarge" style={styles.workoutTitle}>
				{workoutSession.name}
			</Text>
         
         <View style={styles.statsRow}>
            <StatBlock label="Tiempo" value={formatStopwatch(durationSeconds)} />
            <StatBlock label="Volumen" value={formatVolume(workoutSession.volumeKg)} />
            <StatBlock label="Series" value={String(completedSetsCount)} />
         </View>

         <Divider />

         <View style={styles.statsRow}>
            <StatBlock label="Cuando" value={startedAtLabel} />
         </View>

         <Divider />

         <TextInput
            mode="outlined"
            label="Añadir algunas notas"
            value={notes}
            onChangeText={onNotes}
            placeholder="¿Cómo ha ido tu entrenamiento? Deja algunas notas aqui..."
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={[styles.inputWithoutIconContent, styles.textareaContent]}
         />

         <Button
            mode="contained-tonal"
            style={styles.dangerButton}
            labelStyle={styles.dangerButtonLabel}
            contentStyle={styles.footerButtonContent}
            onPress={handleDeleteWorkoutSession}
         >
            Descartar entreno
         </Button>
      </ScrollView>
	);
}

const getStyles = (theme: MD3Theme) =>
   StyleSheet.create({
      content: {
			paddingTop: 22,
			paddingBottom: 48,
		},
      workoutTitle: {
			color: theme.colors.onBackground,
			fontSize: 20,
			fontWeight: "800",
			letterSpacing: 0,
			lineHeight: 30,
		},
      statsRow: {
         flexDirection: "row",
         gap: 38,
         marginVertical: 18,
      },
      input: {
         marginTop: 18,
         marginBottom: 36,
      },
      inputOutline: {
         borderRadius: 18,
         borderCurve: 'continuous',
      },
      inputWithoutIconContent: {
         paddingLeft: 16,
      },
      textareaContent: {
         minHeight: 104,
         paddingTop: 12,
      },
      dangerButton: {
         flex: 1,
         borderRadius: 12,
         backgroundColor: theme.colors.surface,
      },
      dangerButtonLabel: {
         color: '#EF4444',
         fontSize: 15,
         fontWeight: '900',
      },
      footerButtonContent: {
         minHeight: 48,
      },
   });   
