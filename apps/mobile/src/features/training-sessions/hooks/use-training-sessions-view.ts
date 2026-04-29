import { useState } from 'react';
import { useWorkoutPlansQuery } from '../queries/use-workout-plans-query';

export function useTrainingSessionsView() {
   const [expanded, setExpanded] = useState(true);

   // Query para obtener los datos del perfil actual
   const workoutPlansQuery = useWorkoutPlansQuery({ page: 0, limit: 10 });

   // Desglosamos los datos de las rutinas para mostrarlos en la vista.
   const { data, isLoading, isError } = workoutPlansQuery;

   // Lista de rutinas para mostrar en la vista.
   const workoutPlans = data?.items ?? [];

   return {
      expanded,
      isLoading,
      isError,
      workoutPlans,
      setExpanded,
   };
}
