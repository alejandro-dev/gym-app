import {
   CompletedWorkoutSessionFeedRecord,
   toWorkoutSessionFeedItem,
} from './workout-session-feed.mapper';

describe('toWorkoutSessionFeedItem', () => {
   it('aggregates completed sets by exercise and calculates session totals', () => {
      const session = {
         id: 'workoutSession_123',
         name: 'Push day',
         startedAt: new Date('2026-03-24T09:00:00.000Z'),
         endedAt: new Date('2026-03-24T10:15:30.000Z'),
         sets: [
            {
               setNumber: 1,
               reps: 8,
               weightKg: 80,
               exercise: {
                  id: 'exercise_bench',
                  name: 'Bench press',
                  muscleGroup: 'CHEST',
                  imageUrl: 'https://example.com/bench.png',
               },
            },
            {
               setNumber: 2,
               reps: 6,
               weightKg: 82.5,
               exercise: {
                  id: 'exercise_bench',
                  name: 'Bench press',
                  muscleGroup: 'CHEST',
                  imageUrl: 'https://example.com/bench.png',
               },
            },
            {
               setNumber: 1,
               reps: null,
               weightKg: 20,
               exercise: {
                  id: 'exercise_lateral_raise',
                  name: 'Lateral raise',
                  muscleGroup: 'SHOULDERS',
                  imageUrl: null,
               },
            },
         ],
      } as CompletedWorkoutSessionFeedRecord;

      expect(toWorkoutSessionFeedItem(session)).toEqual({
         id: 'workoutSession_123',
         name: 'Push day',
         startedAt: '2026-03-24T09:00:00.000Z',
         endedAt: '2026-03-24T10:15:30.000Z',
         durationSeconds: 4530,
         volumeKg: 1135,
         exercises: [
            {
               id: 'exercise_bench',
               name: 'Bench press',
               muscleGroup: 'CHEST',
               sets: 2,
               completedSets: [
                  { setNumber: 1, reps: 8 },
                  { setNumber: 2, reps: 6 },
               ],
               imageUrl: 'https://example.com/bench.png',
            },
            {
               id: 'exercise_lateral_raise',
               name: 'Lateral raise',
               muscleGroup: 'SHOULDERS',
               sets: 1,
               completedSets: [{ setNumber: 1, reps: null }],
               imageUrl: null,
            },
         ],
         hiddenExercises: 0,
      });
   });

   it('shows only the first three exercises and reports the hidden count', () => {
      const session = {
         id: 'workoutSession_456',
         name: 'Full body',
         startedAt: new Date('2026-03-24T09:00:00.000Z'),
         endedAt: new Date('2026-03-24T09:45:00.000Z'),
         sets: ['squat', 'bench', 'row', 'curl'].map((name, index) => ({
            setNumber: 1,
            reps: 10,
            weightKg: 10,
            exercise: {
               id: `exercise_${name}`,
               name,
               muscleGroup: 'FULL_BODY',
               imageUrl: index === 0 ? 'https://example.com/squat.png' : null,
            },
         })),
      } as CompletedWorkoutSessionFeedRecord;

      const result = toWorkoutSessionFeedItem(session);

      expect(result.exercises).toHaveLength(3);
      expect(result.exercises.map((exercise) => exercise.id)).toEqual([
         'exercise_squat',
         'exercise_bench',
         'exercise_row',
      ]);
      expect(result.hiddenExercises).toBe(1);
   });

   it('never returns a negative duration', () => {
      const session = {
         id: 'workoutSession_789',
         name: 'Clock skew',
         startedAt: new Date('2026-03-24T10:00:00.000Z'),
         endedAt: new Date('2026-03-24T09:59:00.000Z'),
         sets: [],
      } as CompletedWorkoutSessionFeedRecord;

      expect(toWorkoutSessionFeedItem(session).durationSeconds).toBe(0);
   });
});
