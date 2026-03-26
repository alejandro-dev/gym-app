import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { WorkoutProducer } from './workout/workout.producer';
import { WorkoutProcessor } from './workout/workout.processor';
import { WORKOUT_QUEUE } from './workout/workout-queue.constants';
import { AUTH_QUEUE } from './auth/auth-queue.constants';
import { AuthProcessor } from './auth/auth.processor';
import { AuthProducer } from './auth/auth.producer';
import { EmailsModule } from '../notifications/emails/emails.module';

@Global()
@Module({
   imports: [
      BullModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (configService: ConfigService) => ({
            connection: {
               host: configService.get<string>('REDIS_HOST'),
               port: Number(configService.get<string>('REDIS_PORT')),
            },
         }),
      }),
      BullModule.registerQueue({
         name: WORKOUT_QUEUE,
      }),
      BullModule.registerQueue({
         name: AUTH_QUEUE,
      }),
      EmailsModule,
   ],
   providers: [WorkoutProducer, WorkoutProcessor, AuthProducer, AuthProcessor],
   exports: [BullModule, WorkoutProducer, AuthProducer],
})
export class BullmqModule {}
