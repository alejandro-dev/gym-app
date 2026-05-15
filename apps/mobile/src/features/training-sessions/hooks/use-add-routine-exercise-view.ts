import { useState } from "react";
import { router } from 'expo-router';
import { RoutineExerciseDraft, RoutineCatalogExercise } from "../types";
import { toOptionalNumber } from "../utils/routine-form-utils";

type useAddRoutineExerciseViewProps = {
   addExercise: (exercise: Omit<RoutineExerciseDraft, 'id' | 'order'>) => void;
   selectedRoutineExercise: RoutineCatalogExercise | null;
   setSelectedRoutineExercise: (exercise: RoutineCatalogExercise | null) => void;
}

export default function useAddRoutineExerciseView({addExercise, selectedRoutineExercise, setSelectedRoutineExercise}: useAddRoutineExerciseViewProps) {
   const [targetSets, setTargetSets] = useState('');
   const [targetRepsMin, setTargetRepsMin] = useState('');
   const [targetRepsMax, setTargetRepsMax] = useState('');
   const [targetWeightKg, setTargetWeightKg] = useState('');
   const [restSeconds, setRestSeconds] = useState('');
   const [notes, setNotes] = useState('');

   // Validamos si el ejercicio seleccionado es válido para añadir.
   const canAddExercise = Boolean(selectedRoutineExercise);

   // Evento para añadir un ejercicio a la rutina.
   const handleAddExercise = () => {
      // Nos aseguramos de que hay un ejercicio seleccionado.
      if (!selectedRoutineExercise) return;

      // Añadimos el ejercicio a la rutina.
      addExercise({
         exerciseId: selectedRoutineExercise.id,
         exerciseName: selectedRoutineExercise.name,
         muscleGroup: selectedRoutineExercise.muscleGroup,
         category: selectedRoutineExercise.category,
         equipment: selectedRoutineExercise.equipment,
         isCompound: selectedRoutineExercise.isCompound,
         day: null,
         targetSets: toOptionalNumber(targetSets),
         targetRepsMin: toOptionalNumber(targetRepsMin),
         targetRepsMax: toOptionalNumber(targetRepsMax),
         targetWeightKg: toOptionalNumber(targetWeightKg),
         restSeconds: toOptionalNumber(restSeconds),
         notes: notes.trim() ? notes.trim() : null,
      });

      // Volvemos al formulario de selección de ejercicio.
      setSelectedRoutineExercise(null);
      router.back();
   };

   return {
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
   };
}
