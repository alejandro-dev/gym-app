import {
   createContext,
   type ReactNode,
   useContext,
   useMemo,
   useState,
} from 'react';
import type { ExerciseCategory, MuscleGroup } from '@gym-app/types';

export type RoutineExerciseDraft = {
   id: string;
   exerciseId: string;
   exerciseName: string;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
   day: number | null;
   order: number;
   targetSets: number | null;
   targetRepsMin: number | null;
   targetRepsMax: number | null;
   targetWeightKg: number | null;
   restSeconds: number | null;
   notes: string | null;
};

type NewRoutineState = {
   name: string;
   description: string;
   durationWeeks: string;
   selectedGoal: string;
   selectedLevel: string;
   status: string;
   assignAthlete: boolean;
   exercises: RoutineExerciseDraft[];
};

type NewRoutineContextValue = NewRoutineState & {
   canCreateRoutine: boolean;
   setName: (name: string) => void;
   setDescription: (description: string) => void;
   setDurationWeeks: (durationWeeks: string) => void;
   setSelectedGoal: (selectedGoal: string) => void;
   setSelectedLevel: (selectedLevel: string) => void;
   setStatus: (status: string) => void;
   setAssignAthlete: (assignAthlete: boolean) => void;
   addExercise: (exercise: Omit<RoutineExerciseDraft, 'id' | 'order'>) => void;
   removeExercise: (exerciseId: string) => void;
};

const NewRoutineContext = createContext<NewRoutineContextValue | null>(null);

export function NewRoutineProvider({ children }: { children: ReactNode }) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [durationWeeks, setDurationWeeks] = useState('');
   const [selectedGoal, setSelectedGoal] = useState('Hipertrofia');
   const [selectedLevel, setSelectedLevel] = useState('Intermedio');
   const [status, setStatus] = useState('active');
   const [assignAthlete, setAssignAthlete] = useState(true);
   const [exercises, setExercises] = useState<RoutineExerciseDraft[]>([]);

   const canCreateRoutine = name.trim().length > 0 && exercises.length > 0;

   const value = useMemo<NewRoutineContextValue>(
      () => ({
         name,
         description,
         durationWeeks,
         selectedGoal,
         selectedLevel,
         status,
         assignAthlete,
         exercises,
         canCreateRoutine,
         setName,
         setDescription,
         setDurationWeeks,
         setSelectedGoal,
         setSelectedLevel,
         setStatus,
         setAssignAthlete,
         addExercise: (exercise) => {
            setExercises((currentExercises) => [
               ...currentExercises,
               {
                  ...exercise,
                  id: `exercise-${Date.now()}`,
                  order:
                     currentExercises.filter(
                        (currentExercise) => currentExercise.day === exercise.day,
                     ).length + 1,
               },
            ]);
         },
         removeExercise: (exerciseId) => {
            setExercises((currentExercises) =>
               currentExercises.filter((exercise) => exercise.id !== exerciseId),
            );
         },
      }),
      [
         assignAthlete,
         canCreateRoutine,
         description,
         durationWeeks,
         exercises,
         name,
         selectedGoal,
         selectedLevel,
         status,
      ],
   );

   return (
      <NewRoutineContext.Provider value={value}>
         {children}
      </NewRoutineContext.Provider>
   );
}

export function useNewRoutine() {
   const context = useContext(NewRoutineContext);

   if (!context) {
      throw new Error('useNewRoutine must be used within NewRoutineProvider');
   }

   return context;
}
