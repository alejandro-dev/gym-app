import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlanExerciseService } from './workout-plan-exercise.service';

describe('WorkoutPlanExerciseService', () => {
  let service: WorkoutPlanExerciseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutPlanExerciseService],
    }).compile();

    service = module.get<WorkoutPlanExerciseService>(WorkoutPlanExerciseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
