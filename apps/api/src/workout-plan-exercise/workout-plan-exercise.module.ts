import { Module } from '@nestjs/common';
import { WorkoutPlanExerciseService } from './workout-plan-exercise.service';
import { WorkoutPlanExerciseController } from './workout-plan-exercise.controller';

@Module({
  providers: [WorkoutPlanExerciseService],
  controllers: [WorkoutPlanExerciseController]
})
export class WorkoutPlanExerciseModule {}
