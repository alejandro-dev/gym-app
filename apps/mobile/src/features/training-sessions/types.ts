import type { ExerciseCategory, MuscleGroup, WorkoutPlanGoal, WorkoutPlanLevel } from '@gym-app/types';

// Ejercicio disponible en el listado de ejercicios.
export type RoutineCatalogExercise = {
   id: string;
   name: string;
   imageUrl: string | null;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
};

// Borrador local de un ejercicio dentro del formulario.
export type RoutineExerciseDraft = {
   id: string;
   exerciseId: string;
   exerciseName: string;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
   order: number;
   targetSets: number | null;
   targetRepsMin: number | null;
   targetRepsMax: number | null;
   targetWeightKg: number | null;
   restSeconds: number | null;
   notes: string | null;
};

// Estado local de una nueva rutina.
export type NewRoutineState = {
   name: string;
   description: string;
   selectedGoal: WorkoutPlanGoal;
   selectedLevel: WorkoutPlanLevel;
   status: string;
   exercises: RoutineExerciseDraft[];

   // Datos originales de la rutina para poder restaurar los ejercicios eliminados.
   originalExercises: RoutineExerciseDraft[];

   // Ejercicio elegido en el listado de ejercicios antes de confirmarlo en la rutina.
   selectedRoutineExercise: RoutineCatalogExercise | null;
};

// Contexto para la vista de nueva rutina.
export type NewRoutineContextValue = NewRoutineState & {
   canCreateRoutine: boolean;
   setName: (name: string) => void;
   setDescription: (description: string) => void;
   setSelectedGoal: (selectedGoal: WorkoutPlanGoal) => void;
   setSelectedLevel: (selectedLevel: WorkoutPlanLevel) => void;
   setStatus: (status: string) => void;
   addExercise: (exercise: Omit<RoutineExerciseDraft, 'id' | 'order'>) => void;
   removeExercise: (exerciseId: string) => void;
   // Función para resetear los datos de la rutina.
   resetRoutine: () => void;
   setSelectedRoutineExercise: (exercise: RoutineCatalogExercise | null) => void;

   // Función para añadir un ejercicio a la rutina.
   setOriginalExercises: (exercises: RoutineExerciseDraft[]) => void;

   // Precarga el formulario cuando entramos en modo edición.
   hydrateRoutineForEdit: (state: Partial<NewRoutineState>) => void;
};
