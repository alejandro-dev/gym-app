import { Global, Module } from '@nestjs/common';
import { WorkoutProducer } from './workout.producer';

/**
 * Modulo de BullMQ para pruebas end-to-end sin dependencias externas.
 */
@Global()
@Module({
   providers: [
      {
         provide: WorkoutProducer,
         useValue: {
            enqueueWorkoutCompleted: async () => undefined,
         },
      },
   ],
   exports: [WorkoutProducer],
})
export class BullmqTestModule {}
