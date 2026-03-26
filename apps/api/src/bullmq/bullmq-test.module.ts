import { Global, Module } from '@nestjs/common';
import { AuthProducer } from './auth/auth.producer';
import { WorkoutProducer } from './workout/workout.producer';

/**
 * Modulo de BullMQ para pruebas end-to-end sin dependencias externas.
 */
@Global()
@Module({
   providers: [
      {
         provide: WorkoutProducer,
         useValue: {
            enqueueWorkoutCompleted: () => Promise.resolve(),
         },
      },
      {
         provide: AuthProducer,
         useValue: {
            enqueueUserRegistered: () => Promise.resolve(),
         },
      },
   ],
   exports: [WorkoutProducer, AuthProducer],
})
export class BullmqTestModule {}
