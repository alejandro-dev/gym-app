import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlanExerciseController } from './workout-plan-exercise.controller';

describe('WorkoutPlanExerciseController', () => {
  let controller: WorkoutPlanExerciseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlanExerciseController],
    }).compile();

    controller = module.get<WorkoutPlanExerciseController>(WorkoutPlanExerciseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
