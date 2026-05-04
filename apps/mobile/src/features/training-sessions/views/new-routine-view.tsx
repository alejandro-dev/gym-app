import { memo } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, HelperText } from 'react-native-paper';
import {
   WORKOUT_PLAN_GOAL_VALUES,
   WORKOUT_PLAN_LEVEL_VALUES,
} from '@gym-app/types';

import NewRoutineHero from '../components/new-routine-hero';
import RoutineConfigCard from '../components/routine-config-card';
import RoutineExercisesCard from '../components/routine-exercises-card';
import RoutineGeneralInfoCard from '../components/routine-general-info-card';
import { useNewRoutine } from '../context/new-routine-context';

const GOALS = WORKOUT_PLAN_GOAL_VALUES;
const LEVELS = WORKOUT_PLAN_LEVEL_VALUES;

type NewRoutineViewProps = {
   mode?: 'create' | 'edit' | 'duplicate';
   canSubmitRoutine: boolean;
   isSavingRoutine: boolean;
   onSubmitRoutine: () => void;
};

const NewRoutineView = ({ mode = 'create', canSubmitRoutine, isSavingRoutine, onSubmitRoutine }: NewRoutineViewProps) => {
   const insets = useSafeAreaInsets();
   const {
      name,
      description,
      durationWeeks,
      selectedGoal,
      selectedLevel,
      status,
      exercises,
      setName,
      setDescription,
      setDurationWeeks,
      setSelectedGoal,
      setSelectedLevel,
      setStatus,
      removeExercise,
   } = useNewRoutine();

   // Comprobamos si se está actualizando o duplicando la rutina.
   const isEditing = mode === 'edit';
   const isDuplicating = mode === 'duplicate';

   // Modificamos el texto del botón de guardar según el estado.
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
            <NewRoutineHero 
               durationWeeks={durationWeeks}
            />

            <RoutineGeneralInfoCard
               name={name}
               description={description}
               durationWeeks={durationWeeks}
               onNameChange={setName}
               onDescriptionChange={setDescription}
               onDurationWeeksChange={setDurationWeeks}
            />
            <RoutineConfigCard
               goals={GOALS}
               levels={LEVELS}
               selectedGoal={selectedGoal}
               selectedLevel={selectedLevel}
               status={status}
               onGoalChange={setSelectedGoal}
               onLevelChange={setSelectedLevel}
               onStatusChange={setStatus}
            />
            <RoutineExercisesCard
               exercises={exercises}
               onAddExercise={() => router.navigate('/training-sessions/new-exercise')}
               onRemoveExercise={removeExercise}
            />

            <View style={styles.actions}>
               <HelperText type="info" visible={!canSubmitRoutine} style={styles.createHint}>
                  {isEditing
                     ? 'Completa el nombre para editar la rutina.'
                     : isDuplicating
                        ? 'Completa el nombre y revisa los ejercicios para crear la copia.'
                        : 'Completa el nombre y añade al menos un ejercicio para crear la rutina.'}

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
         </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
   );
};

export default memo(NewRoutineView);

const styles = StyleSheet.create({
   keyboardAvoidingView: {
      flex: 1,
   },
   content: {
      flexGrow: 1,
      gap: 16,
      marginBottom: 24,
   },
   actions: {
      gap: 8,
      paddingTop: 4,
      marginBottom: 54,
   },
   createHint: {
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
