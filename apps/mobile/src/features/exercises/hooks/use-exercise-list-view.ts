import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useNewRoutine } from '../../training-sessions/context/new-routine-context';
import { useExercisesQuery } from '../../training-sessions/queries/exercises/use-exercises-query';
import { RoutineCatalogExercise } from '../../training-sessions/types';


export default function useExerciseListView() {
   const { setSelectedRoutineExercise } = useNewRoutine();
   const [exerciseSearch, setExerciseSearch] = useState('');

   // Consulta de ejercicios.
   const { data, isLoading, isError } = useExercisesQuery({
      page: 0,
      limit: 100,
      search: exerciseSearch,
   });

   // Filtrado de ejercicios por búsqueda.
   const filteredExercises = useMemo(
      () => data?.items ?? [],
      [data?.items],
   );

   // Evento para seleccionar un ejercicio.
   const handleSelectExercise = (exercise: RoutineCatalogExercise) => {
      setSelectedRoutineExercise(exercise);
      router.back();
   };

   return {
      exerciseSearch,
      filteredExercises,
      isLoading,
      isError,
      setExerciseSearch,
      handleSelectExercise,
   };
}