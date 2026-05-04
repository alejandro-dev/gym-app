import type { RoutineExerciseDraft } from '../types';

import { buildRoutineExerciseChangeSet } from '../utils/routine-exercise-changes';

const baseExercise: RoutineExerciseDraft = {
   id: 'plan-exercise-1',
   exerciseId: 'exercise-1',
   exerciseName: 'Press banca',
   muscleGroup: 'CHEST',
   category: 'STRENGTH',
   equipment: 'Barra',
   isCompound: true,
   day: 1,
   order: 1,
   targetSets: 4,
   targetRepsMin: 8,
   targetRepsMax: 12,
   targetWeightKg: 80,
   restSeconds: 90,
   notes: 'Tempo controlado',
};

describe('buildRoutineExerciseChangeSet', () => {
   it('detects removed persisted exercises', () => {
      const removedExercise: RoutineExerciseDraft = {
         ...baseExercise,
         id: 'plan-exercise-2',
         exerciseId: 'exercise-2',
      };

      const changeSet = buildRoutineExerciseChangeSet(
         [baseExercise],
         [baseExercise, removedExercise],
      );

      expect(changeSet.removedExercises).toEqual([removedExercise]);
   });

   it('splits local exercises into creates and persisted exercises into updates', () => {
      const localExercise: RoutineExerciseDraft = {
         ...baseExercise,
         id: 'exercise-123',
         exerciseId: 'exercise-3',
         order: 2,
         targetWeightKg: null,
      };

      const changeSet = buildRoutineExerciseChangeSet(
         [baseExercise, localExercise],
         [baseExercise],
      );

      expect(changeSet.exercisesToCreate).toEqual([
         {
            exerciseId: 'exercise-3',
            day: 1,
            order: 2,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 12,
            targetWeightKg: null,
            restSeconds: 90,
            notes: 'Tempo controlado',
         },
      ]);
      expect(changeSet.exercisesToUpdate).toEqual([
         {
            id: 'plan-exercise-1',
            payload: {
               exerciseId: 'exercise-1',
               day: 1,
               order: 1,
               targetSets: 4,
               targetRepsMin: 8,
               targetRepsMax: 12,
               targetWeightKg: 80,
               restSeconds: 90,
               notes: 'Tempo controlado',
            },
         },
      ]);
   });
});
