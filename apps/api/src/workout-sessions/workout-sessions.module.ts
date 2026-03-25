import { Module } from '@nestjs/common';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionsController } from './workout-sessions.controller';

@Module({
  providers: [WorkoutSessionsService],
  controllers: [WorkoutSessionsController],
})
export class WorkoutSessionsModule {}
