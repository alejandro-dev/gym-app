import type { WorkoutPlanExercise } from '@gym-app/types';

import { toOptionalNumber, toRoutineExerciseDraft } from './routine-form-utils';

describe('routine form utils', () => {
   describe('toOptionalNumber', () => {
      it.each([
         ['', null],
         ['   ', null],
         ['8', 8],
         [' 12 ', 12],
         ['4,5', 4.5],
         ['invalid', null],
         ['12 weeks', null],
      ])('converts "%s" to %s', (value, expected) => {
         expect(toOptionalNumber(value)).toBe(expected);
      });
   });

   describe('toRoutineExerciseDraft', () => {
      it('maps a workout plan exercise into an editable draft', () => {
         const workoutPlanExercise: WorkoutPlanExercise = {
            id: 'plan-exercise-1',
            workoutPlanId: 'plan-1',
            exerciseId: 'exercise-1',
            day: 2,
            order: 3,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 12,
            targetWeightKg: 80,
            restSeconds: 90,
            notes: 'Tempo controlado',
            exercise: {
               id: 'exercise-1',
               name: 'Press banca',
               muscleGroup: 'CHEST',
               category: 'STRENGTH',
               equipment: 'Barra',
            },
         };

         expect(toRoutineExerciseDraft(workoutPlanExercise, 'duplicate')).toEqual({
            id: 'duplicate-plan-exercise-1',
            exerciseId: 'exercise-1',
            exerciseName: 'Press banca',
            muscleGroup: 'CHEST',
            category: 'STRENGTH',
            equipment: 'Barra',
            isCompound: false,
            day: 2,
            order: 3,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 12,
            targetWeightKg: 80,
            restSeconds: 90,
            notes: 'Tempo controlado',
         });
      });

      it('keeps persisted ids when no prefix is provided', () => {
         const workoutPlanExercise = {
            id: 'plan-exercise-2',
            workoutPlanId: 'plan-1',
            exerciseId: 'exercise-2',
            day: null,
            order: 1,
            targetSets: null,
            targetRepsMin: null,
            targetRepsMax: null,
            targetWeightKg: null,
            restSeconds: null,
            notes: null,
            exercise: {
               id: 'exercise-2',
               name: 'Dominadas',
               muscleGroup: 'BACK',
               category: 'BODYWEIGHT',
               equipment: null,
               isCompound: true,
            },
         } satisfies WorkoutPlanExercise;

         expect(toRoutineExerciseDraft(workoutPlanExercise).id).toBe(
            'plan-exercise-2',
         );
         expect(toRoutineExerciseDraft(workoutPlanExercise).isCompound).toBe(true);
      });
   });
});
