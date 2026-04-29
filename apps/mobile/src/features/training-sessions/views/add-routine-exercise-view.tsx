import { memo } from 'react';
import {
   KeyboardAvoidingView,
   Platform,
   Pressable,
   StyleSheet,
   View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMuscleGroupLabelEs } from '@gym-app/types';
import {
   Button,
   Card,
   HelperText,
   Text,
   TextInput,
} from 'react-native-paper';

import { resolveApiImageUrl } from '@/services/api/media';

import { useNewRoutine } from '../context/new-routine-context';
import useAddRoutineExerciseView from '../hooks/use-add-routine-exercise-view';
import { RoutineCatalogExercise } from '../types';

const AddRoutineExerciseView = () => {
   const insets = useSafeAreaInsets();
   const { addExercise, selectedRoutineExercise, setSelectedRoutineExercise } = useNewRoutine();
   const { canAddExercise, day, setDay, targetSets, setTargetSets, targetRepsMin, setTargetRepsMin, targetRepsMax, setTargetRepsMax, targetWeightKg, setTargetWeightKg, restSeconds, setRestSeconds, notes, setNotes, handleAddExercise } = useAddRoutineExerciseView({addExercise, selectedRoutineExercise, setSelectedRoutineExercise});
   
   return (
      <KeyboardAvoidingView
         style={styles.keyboardAvoidingView}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={insets.top}
      >
         <KeyboardAwareScrollView
            enableOnAndroid
            extraHeight={120}
            extraScrollHeight={48}
            keyboardOpeningTime={0}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
               styles.content,
               { paddingBottom: insets.bottom + 28 },
            ]}
         >
            <Card mode="contained" style={styles.card}>
               <Card.Content style={styles.cardContent}>
                  <View style={styles.sectionCopy}>
                     <Text variant="titleMedium" style={styles.sectionTitle}>
                        Ejercicio
                     </Text>
                     <Text variant="bodySmall" style={styles.sectionHint}>
                        Selecciona un ejercicio existente para completar la
                        prescripción.
                     </Text>
                  </View>

                  <Pressable
                     style={styles.exerciseSelector}
                     onPress={() =>
                        router.navigate('/training-sessions/exercise-picker')
                     }
                  >
                     {selectedRoutineExercise ? (
                        <ExerciseThumbnail exercise={selectedRoutineExercise} />
                     ) : (
                        <View style={styles.emptyThumbnail}>
                           <Text variant="titleMedium" style={styles.emptyThumbnailText}>
                              +
                           </Text>
                        </View>
                     )}
                     <View style={styles.exerciseSelectorCopy}>
                        <Text variant="titleSmall" style={styles.exerciseName}>
                           {selectedRoutineExercise?.name ?? 'Seleccionar ejercicio'}
                        </Text>
                        <Text variant="bodySmall" style={styles.exerciseSubtitle}>
                           {selectedRoutineExercise
                              ? getMuscleGroupLabelEs(
                                   selectedRoutineExercise.muscleGroup,
                                )
                              : 'Abrir listado de ejercicios'}
                        </Text>
                     </View>
                     <Text variant="labelLarge" style={styles.changeLabel}>
                        {selectedRoutineExercise ? 'Cambiar' : 'Buscar'}
                     </Text>
                  </Pressable>
               </Card.Content>
            </Card>

            <Card mode="contained" style={styles.card}>
               <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                     Prescripción
                  </Text>

                  <View style={styles.inputGrid}>
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Día"
                        value={day}
                        onChangeText={setDay}
                        keyboardType="number-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                     />
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Series"
                        value={targetSets}
                        onChangeText={setTargetSets}
                        keyboardType="number-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                     />
                  </View>

                  <View style={styles.inputGrid}>
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Reps min"
                        value={targetRepsMin}
                        onChangeText={setTargetRepsMin}
                        keyboardType="number-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                     />
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Reps max"
                        value={targetRepsMax}
                        onChangeText={setTargetRepsMax}
                        keyboardType="number-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                     />
                  </View>

                  <View style={styles.inputGrid}>
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Carga"
                        value={targetWeightKg}
                        onChangeText={setTargetWeightKg}
                        keyboardType="decimal-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                        right={<TextInput.Affix text="kg" />}
                     />
                     <TextInput
                        style={styles.gridInput}
                        mode="outlined"
                        label="Descanso"
                        value={restSeconds}
                        onChangeText={setRestSeconds}
                        keyboardType="number-pad"
                        outlineStyle={styles.inputOutline}
                        contentStyle={styles.inputContent}
                        right={<TextInput.Affix text="s" />}
                     />
                  </View>

                  <TextInput
                     mode="outlined"
                     label="Notas"
                     value={notes}
                     onChangeText={setNotes}
                     placeholder="Notas técnicas"
                     multiline
                     numberOfLines={4}
                     outlineStyle={styles.inputOutline}
                     contentStyle={[styles.inputContent, styles.textareaContent]}
                  />
               </Card.Content>
            </Card>

            <View style={styles.actions}>
               <HelperText type="info" visible={!canAddExercise} style={styles.helper}>
                  Selecciona un ejercicio para añadirlo a la rutina.
               </HelperText>
               <Button
                  mode="contained"
                  disabled={!canAddExercise}
                  onPress={handleAddExercise}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  Añadir ejercicio
               </Button>
            </View>
         </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
   );
};

export default memo(AddRoutineExerciseView);

// Función para mostrar una imágen de ejercicio en la vista.
function ExerciseThumbnail({ exercise }: { exercise: RoutineCatalogExercise }) {
   // Obtenemos la URL de la imagen de ejercicio.
   const imageUri = resolveApiImageUrl(exercise.imageUrl);

   // Si no hay URL de imagen, mostramos un la inicial de la palabra del ejercicio.
   if (!imageUri) {
      return (
         <View style={styles.emptyThumbnail}>
            <Text variant="titleMedium" style={styles.emptyThumbnailText}>
               {exercise.name.charAt(0).toUpperCase()}
            </Text>
         </View>
      );
   }

   return (
      <Image
         source={{ uri: imageUri }}
         accessibilityLabel={`Imagen de ${exercise.name}`}
         contentFit="cover"
         style={styles.exerciseThumbnail}
      />
   );
}

const styles = StyleSheet.create({
   keyboardAvoidingView: {
      flex: 1,
   },
   content: {
      flexGrow: 1,
      gap: 16,
      marginBottom: 24,
   },
   card: {
      borderRadius: 26,
      borderCurve: 'continuous',
   },
   cardContent: {
      gap: 16,
      paddingVertical: 18,
   },
   sectionCopy: {
      gap: 4,
   },
   sectionTitle: {
      fontWeight: '800',
   },
   sectionHint: {
      color: '#64748b',
      lineHeight: 18,
   },
   exerciseSelector: {
      alignItems: 'center',
      borderColor: '#dbe3ef',
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 12,
   },
   exerciseSelectorCopy: {
      flex: 1,
      gap: 2,
   },
   exerciseName: {
      fontWeight: '800',
   },
   exerciseSubtitle: {
      color: '#64748b',
   },
   changeLabel: {
      color: '#2563eb',
      fontWeight: '800',
   },
   exerciseThumbnail: {
      backgroundColor: '#e2e8f0',
      borderRadius: 16,
      height: 58,
      width: 58,
   },
   emptyThumbnail: {
      alignItems: 'center',
      backgroundColor: '#e2e8f0',
      borderRadius: 16,
      height: 58,
      justifyContent: 'center',
      width: 58,
   },
   emptyThumbnailText: {
      color: '#475569',
      fontWeight: '800',
   },
   inputGrid: {
      flexDirection: 'row',
      gap: 12,
   },
   gridInput: {
      flex: 1,
   },
   inputOutline: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   inputContent: {
      flex: 1,
      paddingHorizontal: 16,
   },
   textareaContent: {
      minHeight: 104,
      paddingTop: 12,
   },
   actions: {
      gap: 8,
      paddingTop: 4,
      marginBottom: 54,
   },
   helper: {
      marginHorizontal: 0,
      paddingHorizontal: 0,
   },
   button: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 54,
   },
   buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
   },
});
