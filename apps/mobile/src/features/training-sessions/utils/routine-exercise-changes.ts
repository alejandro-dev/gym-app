import type { RoutineExerciseDraft } from '../types';

type RoutineExercisePayload = {
   exerciseId: string;
   order: number;
   targetSets: number | null;
   targetRepsMin: number | null;
   targetRepsMax: number | null;
   targetWeightKg: number | null;
   restSeconds: number | null;
   notes: string | null;
};

export type RoutineExerciseChangeSet = {
   removedExercises: RoutineExerciseDraft[];
   exercisesToCreate: RoutineExercisePayload[];
   exercisesToUpdate: {
      id: string;
      payload: RoutineExercisePayload;
   }[];
};

export function buildRoutineExerciseChangeSet(
   exercises: RoutineExerciseDraft[],
   originalExercises: RoutineExerciseDraft[],
): RoutineExerciseChangeSet {
   const currentPersistedIds = new Set(
      exercises
         .filter((exercise) => !isLocalExerciseId(exercise.id))
         .map((exercise) => exercise.id),
   );

   const removedExercises = originalExercises.filter(
      (exercise) => !currentPersistedIds.has(exercise.id),
   );

   return exercises.reduce<RoutineExerciseChangeSet>(
      (changeSet, exercise) => {
         const payload = toWorkoutPlanExercisePayload(exercise);

         if (isLocalExerciseId(exercise.id)) {
            changeSet.exercisesToCreate.push(payload);
         } else {
            changeSet.exercisesToUpdate.push({
               id: exercise.id,
               payload,
            });
         }

         return changeSet;
      },
      {
         removedExercises,
         exercisesToCreate: [],
         exercisesToUpdate: [],
      },
   );
}

function toWorkoutPlanExercisePayload(exercise: RoutineExerciseDraft) {
   return {
      exerciseId: exercise.exerciseId,
      order: exercise.order,
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      targetWeightKg: exercise.targetWeightKg,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
   };
}

function isLocalExerciseId(id: string) {
   return id.startsWith('exercise-');
}
