import { Prisma } from '@prisma/client';
import type { WorkoutSessionFeedItem } from '@gym-app/types';

/**
 * Selecciona los campos necesarios para construir el feed de sesiones completadas.
 */
export const completedWorkoutSessionFeedSelect = {
   id: true,
   name: true,
   startedAt: true,
   endedAt: true,
   sets: {
      where: { isCompleted: true },
      orderBy: { setNumber: 'asc' },
      select: {
         setNumber: true,
         reps: true,
         weightKg: true,
         exercise: {
            select: {
               id: true,
               name: true,
               muscleGroup: true,
               imageUrl: true,
            },
         },
      },
   },
} satisfies Prisma.WorkoutSessionSelect;

// Tipo de registro de sesion completada.
export type CompletedWorkoutSessionFeedRecord =
   Prisma.WorkoutSessionGetPayload<{
      select: typeof completedWorkoutSessionFeedSelect;
   }>;

// Opciones de mapeo.
type WorkoutSessionFeedMapperOptions = {
   exerciseLimit?: number;
};

/**
 * Convierte una sesion completada de Prisma al item publico del feed.
 *
 * @param session - Sesion completada con sus series y ejercicios
 * @param options - Opciones de mapeo
 * @returns Item de feed serializable para la API
 */
export function toWorkoutSessionFeedItem(
   session: CompletedWorkoutSessionFeedRecord,
   options: WorkoutSessionFeedMapperOptions = {},
): WorkoutSessionFeedItem {
   // Obtenemos las opciones. En este caso el límite de ejercicios que se mostrarán.
   const exerciseLimit = options.exerciseLimit ?? 3;

   // Si no se ha completado, devolvemos la fecha actual.
   const endedAt = session.endedAt ?? new Date();

   // Creamos un mapa para agrupar los ejercicios por id.
   const exercisesById = new Map<
      string,
      {
         id: string;
         name: string;
         muscleGroup: WorkoutSessionFeedItem['exercises'][number]['muscleGroup'];
         sets: number;
         completedSets: WorkoutSessionFeedItem['exercises'][number]['completedSets'];
         imageUrl: string | null;
      }
   >();

   // Inicializamos el volumen a cero.
   let volumeKg = 0;

   // Recorremos todos los ejercicios y actualizamos el mapa.
   for (const set of session.sets) {
      // Obtenemos el ejercicio actual.
      const current = exercisesById.get(set.exercise.id);

      // Agrupamos los ejercicios por id.
      exercisesById.set(set.exercise.id, {
         id: set.exercise.id,
         name: set.exercise.name,
         muscleGroup: set.exercise.muscleGroup,
         sets: (current?.sets ?? 0) + 1,
         completedSets: [
            ...(current?.completedSets ?? []),
            { setNumber: set.setNumber, reps: set.reps },
         ],
         imageUrl: set.exercise.imageUrl,
      });

      // Si se ha completado, actualizamos el volumen.
      if (set.reps !== null && set.weightKg !== null) {
         volumeKg += set.reps * set.weightKg;
      }
   }

   // Obtenemos los ejercicios visibles. En ese momento, solo los tres primeros.
   const exercises = Array.from(exercisesById.values());
   const visibleExercises = Number.isFinite(exerciseLimit)
      ? exercises.slice(0, exerciseLimit)
      : exercises;

   return {
      id: session.id,
      name: session.name,
      startedAt: session.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: Math.max(
         0,
         Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000),
      ),
      volumeKg,
      exercises: visibleExercises,
      hiddenExercises: Math.max(0, exercises.length - visibleExercises.length),
   };
}
