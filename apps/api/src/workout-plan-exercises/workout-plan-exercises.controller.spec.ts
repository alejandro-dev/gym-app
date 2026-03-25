import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

jest.mock(
  'src/auth/guards/access-token.guard',
  () => ({ AccessTokenGuard: class {} }),
  {
    virtual: true,
  },
);
jest.mock('src/auth/guards/roles.guard', () => ({ RolesGuard: class {} }), {
  virtual: true,
});
jest.mock(
  'src/auth/decorators/roles.decorator',
  () => ({ Roles: () => () => undefined }),
  {
    virtual: true,
  },
);
jest.mock(
  'src/auth/decorators/current-user.decorator',
  () => ({ CurrentUser: () => () => undefined }),
  {
    virtual: true,
  },
);

import { WorkoutPlanExerciseController } from './workout-plan-exercises.controller';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';

type CreateWorkoutPlanExerciseDto = {
  workoutPlanId: string;
  exerciseId: string;
  order: number;
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
  restSeconds: number | null;
  notes: string | null;
};

type UpdateWorkoutPlanExerciseDto = Partial<
  Omit<CreateWorkoutPlanExerciseDto, 'workoutPlanId' | 'exerciseId'>
>;

describe('WorkoutPlanExerciseController', () => {
  let controller: WorkoutPlanExerciseController;
  const currentUser = {
    sub: 'user_123',
    email: 'user@example.com',
    role: UserRole.USER,
    tokenType: 'access' as const,
  };

  const workoutPlanExerciseServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto = {
    workoutPlanId: 'workoutPlan_123',
    exerciseId: 'exercise_123',
    order: 1,
    targetSets: 4,
    targetRepsMin: 8,
    targetRepsMax: 12,
    targetWeightKg: 80,
    restSeconds: 90,
    notes: 'Mantener tecnica estricta.',
  };

  const updatedWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto = {
    order: 2,
    targetSets: 5,
    notes: 'Actualizar progresion.',
  };

  const workoutPlanExerciseRecord = {
    id: 'workoutPlanExercise_456',
    ...createWorkoutPlanExerciseDto,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlanExerciseController],
      providers: [
        {
          provide: WorkoutPlanExerciseService,
          useValue: workoutPlanExerciseServiceMock,
        },
      ],
    }).compile();

    controller = module.get<WorkoutPlanExerciseController>(
      WorkoutPlanExerciseController,
    );
  });

  describe('create', () => {
    it('delegates to workoutPlanExerciseService.create', async () => {
      workoutPlanExerciseServiceMock.create.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await controller.create(createWorkoutPlanExerciseDto);

      expect(workoutPlanExerciseServiceMock.create).toHaveBeenCalledWith(
        createWorkoutPlanExerciseDto,
      );
      expect(result).toEqual(workoutPlanExerciseRecord);
    });
  });

  describe('findAll', () => {
    it('delegates to workoutPlanExerciseService.findAll', async () => {
      workoutPlanExerciseServiceMock.findAll.mockResolvedValue([
        workoutPlanExerciseRecord,
      ]);

      const result = await controller.findAll(currentUser, undefined);

      expect(workoutPlanExerciseServiceMock.findAll).toHaveBeenCalledWith(
        currentUser,
        undefined,
      );
      expect(result).toEqual([workoutPlanExerciseRecord]);
    });
  });

  describe('findOne', () => {
    it('delegates to workoutPlanExerciseService.findOne', async () => {
      workoutPlanExerciseServiceMock.findOne.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await controller.findOne(
        currentUser,
        workoutPlanExerciseRecord.id,
      );

      expect(workoutPlanExerciseServiceMock.findOne).toHaveBeenCalledWith(
        currentUser,
        workoutPlanExerciseRecord.id,
      );
      expect(result).toEqual(workoutPlanExerciseRecord);
    });
  });

  describe('update', () => {
    it('delegates to workoutPlanExerciseService.update', async () => {
      workoutPlanExerciseServiceMock.update.mockResolvedValue({
        ...workoutPlanExerciseRecord,
        ...updatedWorkoutPlanExerciseDto,
      });

      const result = await controller.update(
        currentUser,
        workoutPlanExerciseRecord.id,
        updatedWorkoutPlanExerciseDto,
      );

      expect(workoutPlanExerciseServiceMock.update).toHaveBeenCalledWith(
        currentUser,
        workoutPlanExerciseRecord.id,
        updatedWorkoutPlanExerciseDto,
      );
      expect(result).toEqual({
        ...workoutPlanExerciseRecord,
        ...updatedWorkoutPlanExerciseDto,
      });
    });
  });

  describe('remove', () => {
    it('delegates to workoutPlanExerciseService.remove', async () => {
      workoutPlanExerciseServiceMock.remove.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await controller.remove(
        currentUser,
        workoutPlanExerciseRecord.id,
      );

      expect(workoutPlanExerciseServiceMock.remove).toHaveBeenCalledWith(
        currentUser,
        workoutPlanExerciseRecord.id,
      );
      expect(result).toEqual(workoutPlanExerciseRecord);
    });
  });
});
