import type { ExerciseCategory, MuscleGroup } from '@gym-app/types';

export type RoutineCatalogExercise = {
   id: string;
   name: string;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
};

export const ROUTINE_EXERCISE_CATALOG: RoutineCatalogExercise[] = [
   {
      id: 'bench-press',
      name: 'Press banca',
      muscleGroup: 'CHEST',
      category: 'STRENGTH',
      equipment: 'Barra',
      isCompound: true,
   },
   {
      id: 'squat',
      name: 'Sentadilla',
      muscleGroup: 'LEGS',
      category: 'STRENGTH',
      equipment: 'Barra',
      isCompound: true,
   },
   {
      id: 'lat-pulldown',
      name: 'Jalón al pecho',
      muscleGroup: 'BACK',
      category: 'STRENGTH',
      equipment: 'Polea',
      isCompound: true,
   },
   {
      id: 'shoulder-press',
      name: 'Press militar',
      muscleGroup: 'SHOULDERS',
      category: 'STRENGTH',
      equipment: 'Mancuernas',
      isCompound: true,
   },
   {
      id: 'plank',
      name: 'Plancha',
      muscleGroup: 'CORE',
      category: 'BODYWEIGHT',
      equipment: null,
      isCompound: false,
   },
];
