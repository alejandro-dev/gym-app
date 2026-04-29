import { useState } from "react";
import { router } from 'expo-router';
import { RoutineExerciseDraft, RoutineCatalogExercise } from "../types";

type useAddRoutineExerciseViewProps = {
   addExercise: (exercise: Omit<RoutineExerciseDraft, 'id' | 'order'>) => void;
   selectedRoutineExercise: RoutineCatalogExercise | null;
   setSelectedRoutineExercise: (exercise: RoutineCatalogExercise | null) => void;
}

export default function useAddRoutineExerciseView({addExercise, selectedRoutineExercise, setSelectedRoutineExercise}: useAddRoutineExerciseViewProps) {
   const [day, setDay] = useState('1');
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
         day: toOptionalNumber(day) ?? 1,
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
      day,
      setDay,
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

// Función para convertir una cadena de texto en un número opcional.
function toOptionalNumber(value: string) {
   const normalizedValue = value.trim().replace(',', '.');

   if (!normalizedValue) {
      return null;
   }

   const parsedValue = Number(normalizedValue);

   return Number.isFinite(parsedValue) ? parsedValue : null;
}