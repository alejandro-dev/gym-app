import { memo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
   getExerciseCategoryLabelEs,
   getMuscleGroupLabelEs,
} from '@gym-app/types';
import {
   Button,
   Card,
   Chip,
   HelperText,
   Text,
   TextInput,
} from 'react-native-paper';

import { useNewRoutine } from '../context/new-routine-context';
import {
   ROUTINE_EXERCISE_CATALOG,
   type RoutineCatalogExercise,
} from '../data/exercise-catalog';

const AddRoutineExerciseView = () => {
   const insets = useSafeAreaInsets();
   const { addExercise } = useNewRoutine();
   const [selectedExercise, setSelectedExercise] =
      useState<RoutineCatalogExercise | null>(null);
   const [day, setDay] = useState('1');
   const [targetSets, setTargetSets] = useState('');
   const [targetRepsMin, setTargetRepsMin] = useState('');
   const [targetRepsMax, setTargetRepsMax] = useState('');
   const [targetWeightKg, setTargetWeightKg] = useState('');
   const [restSeconds, setRestSeconds] = useState('');
   const [notes, setNotes] = useState('');

   const canAddExercise = Boolean(selectedExercise);

   const handleAddExercise = () => {
      if (!selectedExercise) return;

      addExercise({
         exerciseId: selectedExercise.id,
         exerciseName: selectedExercise.name,
         muscleGroup: selectedExercise.muscleGroup,
         category: selectedExercise.category,
         equipment: selectedExercise.equipment,
         isCompound: selectedExercise.isCompound,
         day: toOptionalNumber(day) ?? 1,
         targetSets: toOptionalNumber(targetSets),
         targetRepsMin: toOptionalNumber(targetRepsMin),
         targetRepsMax: toOptionalNumber(targetRepsMax),
         targetWeightKg: toOptionalNumber(targetWeightKg),
         restSeconds: toOptionalNumber(restSeconds),
         notes: notes.trim() ? notes.trim() : null,
      });

      router.back();
   };

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
                        Selecciona un ejercicio existente, igual que en el editor web
                        de planes.
                     </Text>
                  </View>

                  <View style={styles.catalogList}>
                     {ROUTINE_EXERCISE_CATALOG.map((exercise) => {
                        const isSelected = selectedExercise?.id === exercise.id;

                        return (
                           <Card
                              key={exercise.id}
                              mode={isSelected ? 'contained' : 'outlined'}
                              style={[
                                 styles.exerciseOption,
                                 isSelected ? styles.exerciseOptionSelected : null,
                              ]}
                              onPress={() => setSelectedExercise(exercise)}
                           >
                              <Card.Content style={styles.exerciseOptionContent}>
                                 <Text variant="titleSmall" style={styles.exerciseName}>
                                    {exercise.name}
                                 </Text>
                                 <View style={styles.chipRow}>
                                    <Chip compact>
                                       {getMuscleGroupLabelEs(exercise.muscleGroup)}
                                    </Chip>
                                    <Chip compact>
                                       {getExerciseCategoryLabelEs(exercise.category)}
                                    </Chip>
                                    {exercise.equipment ? (
                                       <Chip compact>{exercise.equipment}</Chip>
                                    ) : null}
                                    {exercise.isCompound ? (
                                       <Chip compact>Multiarticular</Chip>
                                    ) : null}
                                 </View>
                              </Card.Content>
                           </Card>
                        );
                     })}
                  </View>
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

function toOptionalNumber(value: string) {
   const normalizedValue = value.trim().replace(',', '.');

   if (!normalizedValue) {
      return null;
   }

   const parsedValue = Number(normalizedValue);

   return Number.isFinite(parsedValue) ? parsedValue : null;
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
   catalogList: {
      gap: 10,
   },
   exerciseOption: {
      borderRadius: 20,
      borderCurve: 'continuous',
   },
   exerciseOptionSelected: {
      backgroundColor: '#dbeafe',
   },
   exerciseOptionContent: {
      gap: 8,
   },
   exerciseName: {
      fontWeight: '800',
   },
   chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
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
      fontWeight: '700',
   },
});
