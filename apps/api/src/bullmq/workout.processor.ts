import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ExerciseCategory, PersonalRecordMetric } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WORKOUT_JOBS, WORKOUT_QUEUE } from './queue.constants';

// Define el tipo de candidato de record personal
type PersonalRecordCandidate = {
   exerciseId: string;
   metric: PersonalRecordMetric;
   value: number;
};

/**
 * Procesador de BullMQ para la creación de record personal.
 */
@Processor(WORKOUT_QUEUE)
export class WorkoutProcessor extends WorkerHost {
   private readonly logger = new Logger(WorkoutProcessor.name);

   constructor(private readonly prisma: PrismaService) {
      super();
   }

   /**
    * Procesa el trabajo de BullMQ asociado a la sesión completada.
    *
    * @param job - Trabajo de BullMQ asociado a la sesión completada
    */
   async process(job: Job<any>): Promise<void> {
      switch (job.name) {
         case WORKOUT_JOBS.COMPLETED:
            await this.handleWorkoutCompleted(job);
            break;
         default:
            this.logger.warn(`Job no manejado: ${job.name}`);
      }
   }

   /**
    * Procesa la finalizacion de una sesion y evalua nuevos records personales.
    *
    * @param job - Trabajo de BullMQ asociado a la sesion completada
    */
   private async handleWorkoutCompleted(job: Job<any>) {
      // Recuperamos el id de la sesión y el id del usuario asociado
      const { workoutSessionId, userId } = job.data;

      // Consultamos la sesión y sus series completadas siempre y cuando la sesión no sea de calentamiento
      const session = await this.prisma.workoutSession.findUnique({
         where: { id: workoutSessionId, userId },
         select: {
            id: true,
            userId: true,
            startedAt: true,
            endedAt: true,
            sets: {
               where: {
                  isCompleted: true,
                  isWarmup: false,
               },
               select: {
                  exerciseId: true,
                  reps: true,
                  weightKg: true,
                  distanceMeters: true,
                  durationSeconds: true,
                  exercise: {
                     select: {
                        category: true,
                     },
                  },
               },
            },
         },
      });

      // Si no se encontró sesión o no tiene series completadas, no hacemos nada
      if (!session) return;

      // Calculamos candidatos de record personal a partir de las series completadas
      const candidates = this.buildPersonalRecordCandidates(session.sets);

      // Buscamos los record personal existentes para los candidatos
      for (const candidate of candidates) {
         // Buscamos el record personal existente para el ejercicio y el usuario y el método de medida
         const existingRecord = await this.prisma.personalRecord.findFirst({
            where: {
               userId: session.userId,
               exerciseId: candidate.exerciseId,
               metric: candidate.metric,
            },
            orderBy: [
               { value: 'desc' },
               { achievedAt: 'desc' },
            ],
            select: {
               id: true,
               value: true,
            },
         });

         // Si el record personal existe y el valor es menor o igual que el nuevo valor, no lo añadimos y continuamos con el siguiente candidato
         if (existingRecord && candidate.value <= existingRecord.value) {
            continue;
         }

         // Creamos el record personal nuevo
         await this.prisma.personalRecord.create({
            data: {
               user: {
                  connect: {
                     id: session.userId,
                  },
               },
               exercise: {
                  connect: {
                     id: candidate.exerciseId,
                  },
               },
               metric: candidate.metric,
               value: candidate.value,
               achievedAt: session.endedAt ?? session.startedAt,
            },
         });

         this.logger.log(`Nuevo PR detectado para ejercicio ${candidate.exerciseId} (${candidate.metric}=${candidate.value}) en sesión ${workoutSessionId}`);
      }
   }

   /**
    * Calcula candidatos de record personal a partir de las series completadas de una sesion.
    *
    * @param sets - Series completadas y no calentamiento de la sesión
    * @returns Lista de candidatos por ejercicio y metrica
    */
   private buildPersonalRecordCandidates(
      sets: Array<{
         exerciseId: string;
         reps: number | null;
         weightKg: number | null;
         distanceMeters: number | null;
         durationSeconds: number | null;
         exercise: { category: ExerciseCategory };
      }>,
   ): PersonalRecordCandidate[] {
      // Creamos un mapa para agrupar series por ejercicio
      const exerciseSetMap = new Map<string, typeof sets>();

      // Agrupamos series por ejercicio
      for (const set of sets) {
         // Creamos en el array, si no existe, un nuevo objeto con el id del ejercicio
         const exerciseSets = exerciseSetMap.get(set.exerciseId) ?? [];

         // Agregamos la serie al array
         exerciseSets.push(set);

         // Actualizamos el mapa con el nuevo array
         exerciseSetMap.set(set.exerciseId, exerciseSets);
      }

      // Calculamos candidatos de record personal para cada ejercicio
      return Array.from(exerciseSetMap.entries()).flatMap(([exerciseId, exerciseSets]) => {
         const category = exerciseSets[0]?.exercise.category;

         switch (category) {
            case ExerciseCategory.STRENGTH:
               return this.buildStrengthCandidates(exerciseId, exerciseSets);
            case ExerciseCategory.BODYWEIGHT:
               return this.buildBodyweightCandidates(exerciseId, exerciseSets);
            case ExerciseCategory.CARDIO:
               return this.buildCardioCandidates(exerciseId, exerciseSets);
            default:
               return [];
         }
      });
   }

   /**
    * Calcula candidatos de fuerza para un ejercicio.
    *
    * @param exerciseId - Identificador del ejercicio
    * @param sets - Series asociadas al ejercicio
    * @returns Candidatos de fuerza detectados
    */
   private buildStrengthCandidates(
      exerciseId: string,
      sets: Array<{ reps: number | null; weightKg: number | null }>,
   ): PersonalRecordCandidate[] {
      // Inicializamos candidatos
      const candidates: PersonalRecordCandidate[] = [];

      // Calculamos el peso máximo movido
      const maxWeight = Math.max(...sets.map((set) => set.weightKg ?? 0));

      // Si el peso máximo movido es mayor que 0, lo añadimos como candidato
      if (maxWeight > 0) {
         candidates.push({
            exerciseId,
            metric: PersonalRecordMetric.MAX_WEIGHT,
            value: maxWeight,
         });
      }

      // Calculamos el peso máximo estimado para un ejercicio
      const estimatedOneRepMax = Math.max(
         ...sets.map((set) => {
            if (!set.weightKg || !set.reps || set.reps <= 0) return 0;

            return set.weightKg * (1 + set.reps / 30);
         }),
      );

      // Si el peso máximo estimado para un ejercicio es mayor que 0, lo añadimos como candidato
      if (estimatedOneRepMax > 0) {
         candidates.push({
            exerciseId,
            metric: PersonalRecordMetric.ESTIMATED_1RM,
            value: estimatedOneRepMax,
         });
      }

      return candidates;
   }

   /**
    * Calcula candidatos de calistenia o peso corporal para un ejercicio.
    *
    * @param exerciseId - Identificador del ejercicio
    * @param sets - Series asociadas al ejercicio
    * @returns Candidatos de repeticiones maximas
    */
   private buildBodyweightCandidates(
      exerciseId: string,
      sets: Array<{ reps: number | null }>,
   ): PersonalRecordCandidate[] {
      // Calculamos la mayor cantidad de reps
      const maxReps = Math.max(...sets.map((set) => set.reps ?? 0));

      // Si la cantidad de reps es mayor que 0, lo añadimos como candidato
      return maxReps > 0
         ? [
              {
                 exerciseId,
                 metric: PersonalRecordMetric.MAX_REPS,
                 value: maxReps,
              },
           ]
         : [];
   }

   /**
    * Calcula candidatos de cardio para un ejercicio.
    *
    * @param exerciseId - Identificador del ejercicio
    * @param sets - Series asociadas al ejercicio
    * @returns Candidatos de distancia y duracion maximas
    */
   private buildCardioCandidates(
      exerciseId: string,
      sets: Array<{ distanceMeters: number | null; durationSeconds: number | null }>,
   ): PersonalRecordCandidate[] {
      // Inicializamos candidatos
      const candidates: PersonalRecordCandidate[] = [];

      // Calculamos la mayor distancia
      const maxDistance = Math.max(...sets.map((set) => set.distanceMeters ?? 0));

      // Si la distancia es mayor que 0, lo añadimos como candidato
      if (maxDistance > 0) {
         candidates.push({
            exerciseId,
            metric: PersonalRecordMetric.MAX_DISTANCE,
            value: maxDistance,
         });
      }

      // Calculamos la mayor duración
      const maxDuration = Math.max(...sets.map((set) => set.durationSeconds ?? 0));

      // Si la duración es mayor que 0, lo añadimos como candidato
      if (maxDuration > 0) {
         candidates.push({
            exerciseId,
            metric: PersonalRecordMetric.MAX_DURATION,
            value: maxDuration,
         });
      }

      return candidates;
   }
}
