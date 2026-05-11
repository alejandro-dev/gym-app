import { View, StyleSheet } from "react-native";
import { Image } from 'expo-image';
import { resolveApiImageUrl } from '@/services/api/media';
import { RoutineCatalogExercise } from "@/features/training-sessions/types";
import { Text, MD3Theme, useTheme } from "react-native-paper";
import { VIEW_COLORS } from "@/theme/colors";

type ExerciseDetailHeroProps = {
   exercise: RoutineCatalogExercise;
};

// Componente para mostrar el hero de la vista de detalle de ejercicio.
export default function ExerciseDetailHero({ exercise }: ExerciseDetailHeroProps) {
   const theme = useTheme();
   const styles = getStyles(theme);
   const imageUri = resolveApiImageUrl(exercise.imageUrl);

   return (
      <View style={styles.hero}>
         {imageUri ? (
            <Image
               source={{ uri: imageUri }}
               accessibilityLabel={`Imagen de ${exercise.name}`}
               style={styles.heroImage}
               contentFit="contain"
            />
         ) : (
            <View style={styles.emptyHero}>
               <Text style={styles.emptyHeroText}>
                  {exercise.name.slice(0, 2).toUpperCase()}
               </Text>
            </View>
         )}
      </View>
   );
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
   hero: {
      height: 260,
      marginHorizontal: -20,
      backgroundColor: VIEW_COLORS.onDark,
   },
   heroImage: {
      width: '100%',
      height: '100%',
   },
   emptyHero: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   },
   emptyHeroText: {
      color: VIEW_COLORS.subtle,
      fontSize: 54,
      fontWeight: '900',
   },
});