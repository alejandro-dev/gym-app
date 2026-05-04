import {
   createContext,
   type ReactNode,
   useCallback,
   useContext,
   useMemo,
   useState,
} from 'react';
import type {
   WorkoutPlanGoal,
   WorkoutPlanLevel,
} from '@gym-app/types';

import { RoutineCatalogExercise, NewRoutineState, RoutineExerciseDraft, NewRoutineContextValue } from '../types';

// Contexto para la vista de nueva rutina.
const NewRoutineContext = createContext<NewRoutineContextValue | null>(null);

// Función para proveer el contexto de nueva rutina.
export function NewRoutineProvider({ children }: { children: ReactNode }) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [durationWeeks, setDurationWeeks] = useState('');
   const [selectedGoal, setSelectedGoal] =
      useState<WorkoutPlanGoal>('HYPERTROPHY');
   const [selectedLevel, setSelectedLevel] =
      useState<WorkoutPlanLevel>('INTERMEDIATE');
   const [status, setStatus] = useState('active');
   const [exercises, setExercises] = useState<RoutineExerciseDraft[]>([]);
   const [selectedRoutineExercise, setSelectedRoutineExercise] =
      useState<RoutineCatalogExercise | null>(null);
   const [originalExercises, setOriginalExercises] = useState<RoutineExerciseDraft[]>([]);


   // Para crear exigimos nombre y al menos un ejercicio.
   const canCreateRoutine = name.trim().length > 0 && exercises.length > 0;

   // Función para hydratar los datos de la rutina para mostrarlos en la vista.
   const hydrateRoutineForEdit = useCallback(
      (nextState: Partial<NewRoutineState>) => {
         // Hidratamos solo los campos enviados para no pisar estado local que no
         // forma parte de la carga básica, por ejemplo ejercicios en otro paso.
         if (nextState.name !== undefined) setName(nextState.name);
         if (nextState.description !== undefined)
            setDescription(nextState.description);
         if (nextState.durationWeeks !== undefined)
            setDurationWeeks(nextState.durationWeeks);
         if (nextState.selectedGoal !== undefined)
            setSelectedGoal(nextState.selectedGoal);
         if (nextState.selectedLevel !== undefined)
            setSelectedLevel(nextState.selectedLevel);
         if (nextState.status !== undefined) setStatus(nextState.status);
         if (nextState.exercises !== undefined) setExercises(nextState.exercises);
         if (nextState.selectedRoutineExercise !== undefined) {
            setSelectedRoutineExercise(nextState.selectedRoutineExercise);
         }
         if (nextState.exercises !== undefined) {
            setExercises(nextState.exercises);
            setOriginalExercises(nextState.exercises);
         }
      },
      [],
   );

   // Datos de la rutina para mostrarlos en la vista.
   const value = useMemo<NewRoutineContextValue>(
      () => ({
         name,
         description,
         durationWeeks,
         selectedGoal,
         selectedLevel,
         status,
         exercises,
         selectedRoutineExercise,
         canCreateRoutine,
         originalExercises,
         setName,
         setDescription,
         setDurationWeeks,
         setSelectedGoal,
         setSelectedLevel,
         setStatus,
         setSelectedRoutineExercise,
         setOriginalExercises,
         hydrateRoutineForEdit,
         // Añadimos un ejercicio a la rutina y calculamos el orden.
         addExercise: (exercise) => {
            setExercises((currentExercises) => {
               // Obtenemos los ejercicios del mismo día.
               const exercisesInSameDay = currentExercises.filter(
                  (currentExercise) => currentExercise.day === exercise.day,
               );

               // Calculamos el siguiente orden.
               const nextOrder =
                  Math.max(0, ...exercisesInSameDay.map((currentExercise) => currentExercise.order)) + 1;

               // Añadimos el ejercicio y calculamos el orden.
               return [
                  ...currentExercises,
                  {
                     ...exercise,
                     id: `exercise-${Date.now()}`,
                     order: nextOrder,
                  },
               ];
            });
         },
         removeExercise: (exerciseId) => {
            // Quitamos solo del borrador local; la eliminación en API vendrá luego.
            setExercises((currentExercises) =>
               currentExercises.filter((exercise) => exercise.id !== exerciseId),
            );
         },
         resetRoutine: () => {
            setName('');
            setDescription('');
            setDurationWeeks('');
            setSelectedGoal('HYPERTROPHY');
            setSelectedLevel('INTERMEDIATE');
            setStatus('active');
            setExercises([]);
            setSelectedRoutineExercise(null);
            setOriginalExercises([]);
         },
      }),
      [
         canCreateRoutine,
         description,
         durationWeeks,
         exercises,
         hydrateRoutineForEdit,
         name,
         selectedGoal,
         selectedLevel,
         selectedRoutineExercise,
         status,
      ],
   );

   return (
      <NewRoutineContext.Provider value={value}>
         {children}
      </NewRoutineContext.Provider>
   );
}

// Función para obtener el contexto de nueva rutina.
export function useNewRoutine() {
   const context = useContext(NewRoutineContext);

   if (!context) {
      throw new Error('useNewRoutine must be used within NewRoutineProvider');
   }

   return context;
}
