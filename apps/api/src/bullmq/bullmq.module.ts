import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { WorkoutProducer } from './workout.producer';
import { WorkoutProcessor } from './workout.processor';
import { WORKOUT_QUEUE } from './queue.constants';

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
   ],
   providers: [WorkoutProducer, WorkoutProcessor],
   exports: [BullModule, WorkoutProducer],
})
export class BullmqModule { }