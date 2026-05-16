import { getExerciseCategoryLabelEs, getMuscleGroupLabelEs } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { resolveApiImageUrl } from '@/services/api/media';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import { useNewRoutine } from '../context/new-routine-context';
import useAddRoutineExerciseView from '../hooks/use-add-routine-exercise-view';
import type { RoutineCatalogExercise } from '../types';

const AddRoutineExerciseView = () => {
   const insets = useSafeAreaInsets();
   const { addExercise, selectedRoutineExercise, setSelectedRoutineExercise } = useNewRoutine();
   const {
      canAddExercise,
      targetSets,
      setTargetSets,
      targetRepsMin,
      setTargetRepsMin,
      targetRepsMax,
      setTargetRepsMax,
      targetWeightKg,
      setTargetWeightKg,
      restSeconds,
      setRestSeconds,
      notes,
      setNotes,
      handleAddExercise,
   } = useAddRoutineExerciseView({
      addExercise,
      selectedRoutineExercise,
      setSelectedRoutineExercise,
   });

   return (
      <KeyboardAvoidingView
         style={styles.keyboardAvoidingView}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={insets.top}
      >
         <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
               styles.content,
               { paddingBottom: insets.bottom + 28 },
            ]}
         >
            <View style={styles.header}>
               <Pressable onPress={() => router.back()} style={styles.iconButton}>
                  <MaterialDesignIcons color={VIEW_COLORS.onDark} name="arrow-left" size={20} />
               </Pressable>

               <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>ROUTINE EXERCISE</Text>
                  <Text style={styles.title}>Añadir ejercicio</Text>
               </View>
            </View>

            <View style={styles.exerciseCard}>
               <View style={styles.exerciseCardHeader}>
                  <Text style={styles.sectionTitle}>Ejercicio</Text>
               </View>

               <Pressable
                  style={styles.exerciseSelector}
                  onPress={() => router.back()}
               >
                  {selectedRoutineExercise ? (
                     <ExerciseThumbnail exercise={selectedRoutineExercise} />
                  ) : (
                     <View style={styles.emptyThumb}>
                        <MaterialDesignIcons color="#6F7682" name="plus" size={20} />
                     </View>
                  )}
                  <View style={styles.exerciseSelectorCopy}>
                     <Text numberOfLines={1} style={styles.exerciseName}>
                        {selectedRoutineExercise?.name ?? 'Seleccionar ejercicio'}
                     </Text>
                     <Text numberOfLines={1} style={styles.exerciseSubtitle}>
                        {selectedRoutineExercise
                           ? [
                                getMuscleGroupLabelEs(selectedRoutineExercise.muscleGroup),
                                getExerciseCategoryLabelEs(selectedRoutineExercise.category),
                                selectedRoutineExercise.equipment,
                             ]
                                .filter(Boolean)
                                .join(' • ')
                           : 'Elige el movimiento antes de prescribirlo'}
                     </Text>

                  </View>
                  <Text style={styles.swapButtonText}>
                        {selectedRoutineExercise ? 'Cambiar' : 'Buscar'}
                     </Text>
               </Pressable>
            </View>

            <View style={styles.sectionCard}>
               <Text style={styles.sectionTitle}>Prescripción</Text>

               <View style={styles.inputGrid}>
                  <Field
                     label="Series"
                     value={targetSets}
                     onChangeText={setTargetSets}
                     keyboardType="number-pad"
                  />
                  <Field
                     label="Descanso"
                     value={restSeconds}
                     onChangeText={setRestSeconds}
                     keyboardType="number-pad"
                     suffix="s"
                  />
               </View>

               <View style={styles.inputGrid}>
                  <Field
                     label="Rep min"
                     value={targetRepsMin}
                     onChangeText={setTargetRepsMin}
                     keyboardType="number-pad"
                  />
                  <Field
                     label="Rep max"
                     value={targetRepsMax}
                     onChangeText={setTargetRepsMax}
                     keyboardType="number-pad"
                  />
               </View>

               <Field
                  label="Carga objetivo"
                  value={targetWeightKg}
                  onChangeText={setTargetWeightKg}
                  keyboardType="decimal-pad"
                  suffix="kg"
               />

               <TextInput
                  mode="outlined"
                  label="Notas"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Notas técnicas, tempo, rango o cues"
                  multiline
                  numberOfLines={4}
                  outlineStyle={styles.inputOutline}
                  contentStyle={styles.textareaContent}
                  style={styles.input}
                  textColor={VIEW_COLORS.onDark}
                  theme={inputTheme}
               />
            </View>

            <View style={styles.actions}>
               <HelperText type="info" visible={!canAddExercise} style={styles.helper}>
                  Selecciona un ejercicio antes de añadirlo a la rutina.
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
         </ScrollView>
      </KeyboardAvoidingView>
   );
};

function Field({
   label,
   value,
   onChangeText,
   keyboardType,
   suffix,
}: {
   label: string;
   value: string;
   onChangeText: (value: string) => void;
   keyboardType: 'number-pad' | 'decimal-pad';
   suffix?: string;
}) {
   return (
      <TextInput
         mode="outlined"
         label={label}
         value={value}
         onChangeText={onChangeText}
         keyboardType={keyboardType}
         outlineStyle={styles.inputOutline}
         contentStyle={styles.inputContent}
         style={[styles.input, styles.gridInput]}
         textColor={VIEW_COLORS.onDark}
         theme={inputTheme}
         right={suffix ? <TextInput.Affix text={suffix} textStyle={styles.affixText} /> : undefined}
      />
   );
}

function ExerciseThumbnail({ exercise }: { exercise: RoutineCatalogExercise }) {
   const imageUri = resolveApiImageUrl(exercise.imageUrl);

   if (!imageUri) {
      const initials = exercise.name
         .split(' ')
         .slice(0, 2)
         .map((part) => part.charAt(0))
         .join('')
         .toUpperCase();

      return (
         <View style={styles.emptyThumb}>
            <Text style={styles.emptyThumbText}>{initials}</Text>
         </View>
      );
   }

   return (
      <Image
         source={{ uri: imageUri }}
         accessibilityLabel={`Imagen de ${exercise.name}`}
         contentFit="cover"
         style={styles.exerciseThumb}
      />
   );
}

const inputTheme = {
   colors: {
      background: '#181A20',
      onSurfaceVariant: '#6F7682',
      outline: '#34303A',
      primary: AUTH_COLORS.primary,
      surface: '#181A20',
   },
};

export default memo(AddRoutineExerciseView);

const styles = StyleSheet.create({
   actions: {
      gap: 8,
      marginTop: 2,
   },
   affixText: {
      color: '#9EA3AD',
      fontSize: 12,
      fontWeight: '700',
   },
   button: {
      borderRadius: 16,
      backgroundColor: AUTH_COLORS.primary,
   },
   buttonContent: {
      minHeight: 52,
   },
   buttonLabel: {
      color: AUTH_COLORS.primaryForeground,
      fontSize: 15,
      fontWeight: '900',
   },
   content: {
      gap: 12,
      paddingBottom: 28,
      paddingTop: 12,
   },
   emptyThumb: {
      alignItems: 'center',
      backgroundColor: '#E7E6E0',
      borderRadius: 12,
      height: 54,
      justifyContent: 'center',
      width: 54,
   },
   emptyThumbText: {
      color: '#737373',
      fontFamily: 'monospace',
      fontSize: 18,
      fontWeight: '800',
   },
   exerciseCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 14,
      padding: 14,
   },
   exerciseCardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   exerciseName: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   exerciseSelector: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 12,
   },
   exerciseSelectorCopy: {
      flex: 1,
      gap: 2,
   },
   exerciseSubtitle: {
      color: '#6F7682',
      fontSize: 10,
      lineHeight: 14,
   },
   exerciseThumb: {
      backgroundColor: '#E7E6E0',
      borderRadius: 12,
      height: 54,
      width: 54,
   },
   gridInput: {
      flex: 1,
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      height: 48,
      marginBottom: 2,
   },
   headerCopy: {
      flex: 1,
      gap: 2,
   },
   helper: {
      color: '#6F7682',
      marginHorizontal: 0,
      paddingHorizontal: 0,
   },
   iconButton: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
   },
   input: {
      backgroundColor: '#181A20',
   },
   inputContent: {
      color: VIEW_COLORS.onDark,
      paddingHorizontal: 8,
   },
   inputGrid: {
      flexDirection: 'row',
      gap: 12,
   },
   inputOutline: {
      borderRadius: 14,
      borderWidth: 1,
   },
   keyboardAvoidingView: {
      flex: 1,
   },
   sectionCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 14,
   },
   sectionTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   swapButton: {
      backgroundColor: '#261B11',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
   },
   swapButtonText: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '800',
   },
   textareaContent: {
      color: VIEW_COLORS.onDark,
      minHeight: 88,
      paddingHorizontal: 12,
      paddingTop: 12,
   },
   title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
   },
   eyebrow: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
   },
});
