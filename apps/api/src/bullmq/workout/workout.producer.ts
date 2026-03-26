import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WORKOUT_JOBS, WORKOUT_QUEUE } from './workout-queue.constants';

@Injectable()
export class WorkoutProducer {
   constructor(
      @InjectQueue(WORKOUT_QUEUE)
      private readonly workoutQueue: Queue,
   ) {}

   async enqueueWorkoutCompleted(workoutSessionId: string, userId: string) {
      await this.workoutQueue.add(
         WORKOUT_JOBS.COMPLETED,
         {
            workoutSessionId,
            userId,
         },
         {
            attempts: 3,
            backoff: {
               type: 'exponential',
               delay: 2000,
            },
            removeOnComplete: true,
            removeOnFail: false,
         },
      );
   }
}
