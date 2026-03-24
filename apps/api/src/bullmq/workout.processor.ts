import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { WORKOUT_JOBS, WORKOUT_QUEUE } from './queue.constants';

@Processor(WORKOUT_QUEUE)
export class WorkoutProcessor extends WorkerHost {
   private readonly logger = new Logger(WorkoutProcessor.name);

   constructor(private readonly prisma: PrismaService) {
      super();
   }

   async process(job: Job<any>): Promise<void> {
      switch (job.name) {
         case WORKOUT_JOBS.COMPLETED:
            await this.handleWorkoutCompleted(job);
            break;
         default:
            this.logger.warn(`Job no manejado: ${job.name}`);
      }
   }

   private async handleWorkoutCompleted(job: Job<any>) {
      const { workoutSessionId, userId } = job.data;

      this.logger.log(
         `Procesando workout.completed para sesión ${workoutSessionId} to user ${userId}`,
      );

      const session = await this.prisma.workoutSession.findUnique({
         where: { id: workoutSessionId },
         include: {
            sets: true,
         },
      });

      if (!session) {
         this.logger.warn(`No existe la sesión ${workoutSessionId}`);
         return;
      }

      const totalVolume = session.sets.reduce((acc, set) => {
         const reps = set.reps ?? 0;
         const weight = set.weightKg ?? 0;
         return acc + reps * weight;
      }, 0);

      this.logger.log(
         `Sesión ${workoutSessionId} procesada. Volumen total: ${totalVolume}`,
      );

      // Aquí luego podrás:
      // - recalcular personal records
      // - guardar estadísticas agregadas
      // - disparar notificaciones
      // - generar achievements
   }
}