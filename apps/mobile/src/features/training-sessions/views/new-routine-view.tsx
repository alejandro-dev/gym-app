import {
   getExerciseCategoryLabelEs,
   getWorkoutPlanGoalLabelEs,
   getWorkoutPlanLevelLabelEs,
   WORKOUT_PLAN_GOAL_VALUES,
   WORKOUT_PLAN_LEVEL_VALUES,
} from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import { useNewRoutine } from '../context/new-routine-context';

type NewRoutineViewProps = {
   mode?: 'create' | 'edit' | 'duplicate';
   canSubmitRoutine: boolean;
   isSavingRoutine: boolean;
   onSubmitRoutine: () => void;
};

const NewRoutineView = ({
   mode = 'create',
   canSubmitRoutine,
   isSavingRoutine,
   onSubmitRoutine,
}: NewRoutineViewProps) => {
   const insets = useSafeAreaInsets();
   const {
      name,
      description,
      selectedGoal,
      selectedLevel,
      status,
      exercises,
      setName,
      setDescription,
      setSelectedGoal,
      setSelectedLevel,
      setStatus,
      removeExercise,
   } = useNewRoutine();

   const isEditing = mode === 'edit';
   const isDuplicating = mode === 'duplicate';

   const submitLabel = isEditing
      ? isSavingRoutine
         ? 'Guardando...'
         : 'Guardar cambios'
      : isDuplicating
         ? isSavingRoutine
            ? 'Duplicando...'
            : 'Crear copia'
         : isSavingRoutine
            ? 'Creando...'
            : 'Crear rutina';

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

               <Text style={styles.headerTitle}>Crear rutina</Text>

               <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                     {isEditing ? 'EDIT' : isDuplicating ? 'COPY' : 'NEW'}
                  </Text>
               </View>
            </View>

            <View style={styles.heroCard}>
               <View style={styles.heroTopRow}>
                  <View style={styles.heroIcon}>
                     <MaterialDesignIcons
                        color={AUTH_COLORS.primaryForeground}
                        name="playlist-edit"
                        size={18}
                     />
                  </View>

                  <View style={styles.heroCopy}>
                     <Text style={styles.heroTitle}>Nuevo plan de entrenamiento</Text>
                     <Text style={styles.heroDescription}>
                        Define bloque, objetivo y ejercicios antes de guardarlo.
                     </Text>
                  </View>
               </View>

               <View style={styles.heroMetaRow}>
                  <MetaPill label="ejercicios" value={String(exercises.length)} />
               </View>
            </View>

            <View style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Datos generales</Text>
               </View>

               <TextInput
                  mode="outlined"
                  label="Nombre de rutina"
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Upper / Lower 4 días"
                  left={<TextInput.Icon icon="lightning-bolt-outline" />}
                  contentStyle={styles.inputContent}
                  outlineStyle={styles.inputOutline}
                  style={styles.input}
                  textColor={VIEW_COLORS.onDark}
                  theme={inputTheme}
                />

               <TextInput
                  mode="outlined"
                  label="Descripción"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descripción, objetivo de bloque y notas globales"
                  multiline
                  numberOfLines={4}
                  contentStyle={[styles.inputContent, styles.textareaContent]}
                  outlineStyle={styles.inputOutline}
                  style={styles.input}
                  textColor={VIEW_COLORS.onDark}
                  theme={inputTheme}
               />
            </View>

            <View style={styles.sectionCard}>
               <Text style={styles.sectionTitle}>Configuración</Text>
               <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Objetivo</Text>
                  <View style={styles.chipRow}>
                     {WORKOUT_PLAN_GOAL_VALUES.map((goal) => (
                        <Pressable
                           key={goal}
                           onPress={() => setSelectedGoal(goal)}
                           style={[
                              styles.choiceChip,
                              selectedGoal === goal && styles.choiceChipActive,
                           ]}
                        >
                           <Text
                              style={[
                                 styles.choiceChipText,
                                 selectedGoal === goal && styles.choiceChipTextActive,
                              ]}
                           >
                              {getWorkoutPlanGoalLabelEs(goal)}
                           </Text>
                        </Pressable>
                     ))}
                  </View>
               </View>

               <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Nivel</Text>
                  <View style={styles.segmented}>
                     {WORKOUT_PLAN_LEVEL_VALUES.map((level) => (
                        <Pressable
                           key={level}
                           onPress={() => setSelectedLevel(level)}
                           style={[
                              styles.segmentItem,
                              selectedLevel === level && styles.segmentItemActive,
                           ]}
                        >
                           <Text
                              style={[
                                 styles.segmentText,
                                 selectedLevel === level && styles.segmentTextActive,
                              ]}
                           >
                              {getWorkoutPlanLevelLabelEs(level)}
                           </Text>
                        </Pressable>
                     ))}
                  </View>
               </View>

               <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Estado</Text>
                  <View style={styles.segmented}>
                     {[
                        { value: 'active', label: 'Activo' },
                        { value: 'draft', label: 'Draft' },
                     ].map((item) => (
                        <Pressable
                           key={item.value}
                           onPress={() => setStatus(item.value)}
                           style={[
                              styles.segmentItem,
                              status === item.value && styles.segmentItemWarmActive,
                           ]}
                        >
                           <Text
                              style={[
                                 styles.segmentText,
                                 status === item.value && styles.segmentTextWarmActive,
                              ]}
                           >
                              {item.label}
                           </Text>
                        </Pressable>
                     ))}
                  </View>
               </View>
            </View>

            <View style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <View>
                     <Text style={styles.sectionTitle}>Ejercicios</Text>
                     <Text style={styles.sectionSubtle}>
                        Secuencia la rutina y define cada estímulo.
                     </Text>
                  </View>
                  <View style={styles.countBadge}>
                     <Text style={styles.countBadgeText}>{exercises.length}</Text>
                  </View>
               </View>

               {exercises.length > 0 ? (
                  <View style={styles.exerciseList}>
                     {exercises.map((exercise, index) => (
                        <View key={exercise.id} style={styles.exerciseRow}>
                           <View style={styles.exerciseRowMain}>
                              <View style={styles.orderBadge}>
                                 <Text style={styles.orderBadgeText}>{index + 1}</Text>
                              </View>

                              <View style={styles.exerciseCopy}>
                                 <Text numberOfLines={1} style={styles.exerciseName}>
                                    {exercise.exerciseName}
                                 </Text>
                                 <Text numberOfLines={1} style={styles.exerciseMeta}>
                                    {[
                                       getExerciseCategoryLabelEs(exercise.category),
                                       exercise.equipment,
                                       exercise.targetSets
                                          ? `${exercise.targetSets} series`
                                          : null,
                                    ]
                                       .filter(Boolean)
                                       .join(' • ')}
                                 </Text>
                              </View>
                           </View>

                           <Pressable
                              accessibilityLabel={`Eliminar ${exercise.exerciseName}`}
                              onPress={() => removeExercise(exercise.id)}
                              style={styles.deleteButton}
                           >
                              <MaterialDesignIcons color="#EF4444" name="trash-can-outline" size={16} />
                           </Pressable>
                        </View>
                     ))}
                  </View>
               ) : (
                  <View style={styles.emptyState}>
                     <Text style={styles.emptyStateText}>
                        Completa el nombre y añade al menos un ejercicio.
                     </Text>
                  </View>
               )}

               <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => router.navigate('/training-sessions/exercise-picker')}
                  contentStyle={styles.addButtonContent}
                  labelStyle={styles.addButtonLabel}
                  style={styles.addButton}
                  textColor={AUTH_COLORS.primary}
               >
                  Añadir ejercicio
               </Button>
            </View>

            <View style={styles.actions}>
               <HelperText type="info" visible={!canSubmitRoutine} style={styles.createHint}>
                  {isEditing
                     ? 'Completa el nombre para editar la rutina.'
                     : isDuplicating
                        ? 'Completa el nombre y revisa los ejercicios para crear la copia.'
                        : 'Completa el nombre y añade al menos un ejercicio.'}
               </HelperText>

               <Button
                  mode="contained"
                  disabled={!canSubmitRoutine}
                  loading={isSavingRoutine}
                  onPress={onSubmitRoutine}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
               >
                  {submitLabel}
               </Button>
            </View>
         </ScrollView>
      </KeyboardAvoidingView>
   );
};

function MetaPill({
   label,
   value,
   accent = false,
}: {
   label: string;
   value: string;
   accent?: boolean;
}) {
   return (
      <View style={[styles.metaPill, accent && styles.metaPillAccent]}>
         <Text style={[styles.metaPillValue, accent && styles.metaPillValueAccent]}>{value}</Text>
         <Text style={styles.metaPillLabel}>{label}</Text>
      </View>
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

export default memo(NewRoutineView);

const styles = StyleSheet.create({
   actions: {
      gap: 8,
      marginTop: 2,
   },
   addButton: {
      borderColor: AUTH_COLORS.primary,
      borderRadius: 14,
   },
   addButtonContent: {
      minHeight: 42,
   },
   addButtonLabel: {
      fontSize: 13,
      fontWeight: '900',
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
   choiceChip: {
      backgroundColor: '#211F26',
      borderColor: '#34303A',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
   },
   choiceChipActive: {
      backgroundColor: AUTH_COLORS.primary,
      borderColor: AUTH_COLORS.primary,
   },
   choiceChipText: {
      color: '#B8BCC6',
      fontSize: 11,
      fontWeight: '700',
   },
   choiceChipTextActive: {
      color: AUTH_COLORS.primaryForeground,
   },
   chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   content: {
      gap: 12,
      paddingBottom: 28,
      paddingTop: 12,
   },
   countBadge: {
      backgroundColor: '#211F26',
      borderRadius: 999,
      minWidth: 24,
      paddingHorizontal: 8,
      paddingVertical: 4,
   },
   countBadgeText: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
   },
   createHint: {
      color: '#6F7682',
      marginHorizontal: 0,
      paddingHorizontal: 0,
   },
   deleteButton: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 10,
      height: 28,
      justifyContent: 'center',
      width: 28,
   },
   emptyState: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 74,
      paddingHorizontal: 16,
   },
   emptyStateText: {
      color: '#6F7682',
      fontSize: 12,
      textAlign: 'center',
   },
   exerciseCopy: {
      flex: 1,
      gap: 2,
   },
   exerciseList: {
      gap: 10,
   },
   exerciseMeta: {
      color: '#6F7682',
      fontSize: 10,
      lineHeight: 14,
   },
   exerciseName: {
      color: VIEW_COLORS.onDark,
      fontSize: 13,
      fontWeight: '800',
   },
   exerciseRow: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 10,
   },
   exerciseRowMain: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 10,
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      height: 48,
   },
   headerBadge: {
      backgroundColor: '#261B11',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
   },
   headerBadgeText: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 9,
      fontWeight: '800',
   },
   headerTitle: {
      color: VIEW_COLORS.onDark,
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
   },
   heroCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 14,
      padding: 14,
   },
   heroCopy: {
      flex: 1,
      gap: 2,
   },
   heroDescription: {
      color: '#9EA3AD',
      fontSize: 11,
      lineHeight: 16,
   },
   heroIcon: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 12,
      height: 28,
      justifyContent: 'center',
      width: 28,
   },
   heroMetaRow: {
      flexDirection: 'row',
      gap: 8,
   },
   heroTitle: {
      color: VIEW_COLORS.onDark,
      fontSize: 14,
      fontWeight: '800',
   },
   heroTopRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
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
   },
   inputOutline: {
      borderRadius: 14,
      borderWidth: 1,
   },
   keyboardAvoidingView: {
      flex: 1,
   },
   metaPill: {
      backgroundColor: '#211F26',
      borderRadius: 12,
      gap: 2,
      minHeight: 54,
      padding: 10,
      minWidth: 88,
   },
   metaPillAccent: {
      backgroundColor: '#261B11',
   },
   metaPillLabel: {
      color: '#6F7682',
      fontSize: 9,
   },
   metaPillValue: {
      color: VIEW_COLORS.onDark,
      fontSize: 13,
      fontWeight: '800',
   },
   metaPillValueAccent: {
      color: AUTH_COLORS.primary,
   },
   optionGroup: {
      gap: 8,
   },
   optionLabel: {
      color: '#9EA3AD',
      fontSize: 11,
      fontWeight: '700',
   },
   orderBadge: {
      alignItems: 'center',
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 10,
      height: 22,
      justifyContent: 'center',
      width: 22,
   },
   orderBadgeText: {
      color: AUTH_COLORS.primaryForeground,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '900',
   },
   sectionCard: {
      backgroundColor: AUTH_COLORS.elevatedSurface,
      borderColor: AUTH_COLORS.elevatedOutline,
      borderRadius: 18,
      borderWidth: 1,
      gap: 14,
      padding: 14,
   },
   sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
   },
   sectionHint: {
      color: '#6F7682',
      fontFamily: 'monospace',
      fontSize: 9,
      fontWeight: '700',
   },
   sectionSubtle: {
      color: '#6F7682',
      fontSize: 11,
      marginTop: 2,
   },
   sectionTitle: {
      color: VIEW_COLORS.onDark,
      fontSize: 14,
      fontWeight: '800',
   },
   segmented: {
      backgroundColor: '#211F26',
      borderColor: '#34303A',
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 4,
      padding: 4,
   },
   segmentItem: {
      alignItems: 'center',
      borderRadius: 999,
      flex: 1,
      justifyContent: 'center',
      minHeight: 32,
      paddingHorizontal: 8,
   },
   segmentItemActive: {
      backgroundColor: '#2A2E36',
   },
   segmentItemWarmActive: {
      backgroundColor: AUTH_COLORS.primary,
   },
   segmentText: {
      color: '#9EA3AD',
      fontSize: 11,
      fontWeight: '700',
   },
   segmentTextActive: {
      color: VIEW_COLORS.onDark,
   },
   segmentTextWarmActive: {
      color: AUTH_COLORS.primaryForeground,
   },
   textareaContent: {
      minHeight: 84,
      paddingTop: 12,
   },
});
