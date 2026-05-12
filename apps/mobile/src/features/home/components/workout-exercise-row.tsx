import { VIEW_COLORS } from "@/theme/colors";
import { WorkoutSessionFeedExercise } from "@gym-app/types";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Image } from 'expo-image';
import { resolveApiImageUrl } from "@/services/api/media";

export default function WorkoutExerciseRow({ exercise }: { exercise: WorkoutSessionFeedExercise }) {
   let imageUri = null;

   // Obtenemos la URL de la imagen de ejercicio.
   imageUri = resolveApiImageUrl(exercise.imageUrl);

   return (
      <View style={styles.exerciseRow}>
         <View style={styles.exerciseThumb}>
            {imageUri ? 
            (
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
            {exercise.sets} serie {exercise.name}
         </Text>
      </View>
   );
}

const styles = StyleSheet.create({
   exerciseRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 18,
      minHeight: 52,
   },
   exerciseThumb: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: VIEW_COLORS.mediaPlaceholder,
   },
   exerciseName: {
      color: VIEW_COLORS.onDark,
      flex: 1,
      fontSize: 18,
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 24,
   },
   thumbnailImage: {
      width: '100%',
      height: '100%',
   },
   thumbnailText: {
      color: '#171717',
      fontWeight: '900',
   },
});