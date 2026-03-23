import { Module } from '@nestjs/common';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';
import { WorkoutPlanExerciseController } from './workout-plan-exercises.controller';

@Module({
  providers: [WorkoutPlanExerciseService],
  controllers: [WorkoutPlanExerciseController]
})
export class WorkoutPlanExerciseModule {}
