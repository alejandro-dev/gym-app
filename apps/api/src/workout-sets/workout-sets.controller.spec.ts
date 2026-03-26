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

import { WorkoutSetsController } from './workout-sets.controller';
import { WorkoutSetsService } from './workout-sets.service';

describe('WorkoutSetsController', () => {
   let controller: WorkoutSetsController;
   const currentUser = {
      sub: 'user_123',
      email: 'user@example.com',
      role: UserRole.USER,
      tokenType: 'access' as const,
   };

   const workoutSetsServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
   };

   const createWorkoutSetDto = {
      workoutSessionId: 'workoutSession_123',
      exerciseId: 'exercise_123',
      setNumber: 1,
      reps: 10,
      weightKg: 80,
      durationSeconds: null,
      distanceMeters: null,
      rir: 2,
      isWarmup: false,
      isCompleted: true,
   };

   const workoutSetRecord = {
      id: 'workoutSet_456',
      ...createWorkoutSetDto,
      createdAt: new Date('2026-03-23T10:00:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         controllers: [WorkoutSetsController],
         providers: [
            {
               provide: WorkoutSetsService,
               useValue: workoutSetsServiceMock,
            },
         ],
      }).compile();

      controller = module.get<WorkoutSetsController>(WorkoutSetsController);
   });

   it('delegates create to the service', async () => {
      workoutSetsServiceMock.create.mockResolvedValue(workoutSetRecord);
      const result = await controller.create(createWorkoutSetDto);
      expect(workoutSetsServiceMock.create).toHaveBeenCalledWith(
         createWorkoutSetDto,
      );
      expect(result).toEqual(workoutSetRecord);
   });

   it('delegates findAll to the service', async () => {
      workoutSetsServiceMock.findAll.mockResolvedValue([workoutSetRecord]);
      const result = await controller.findAll(currentUser, undefined);
      expect(workoutSetsServiceMock.findAll).toHaveBeenCalledWith(
         currentUser,
         undefined,
      );
      expect(result).toEqual([workoutSetRecord]);
   });

   it('delegates findOne to the service', async () => {
      workoutSetsServiceMock.findOne.mockResolvedValue(workoutSetRecord);
      const result = await controller.findOne(currentUser, workoutSetRecord.id);
      expect(workoutSetsServiceMock.findOne).toHaveBeenCalledWith(
         currentUser,
         workoutSetRecord.id,
      );
      expect(result).toEqual(workoutSetRecord);
   });

   it('delegates update to the service', async () => {
      workoutSetsServiceMock.update.mockResolvedValue({
         ...workoutSetRecord,
         reps: 8,
      });
      const result = await controller.update(currentUser, workoutSetRecord.id, {
         reps: 8,
      });
      expect(workoutSetsServiceMock.update).toHaveBeenCalledWith(
         currentUser,
         workoutSetRecord.id,
         { reps: 8 },
      );
      expect(result).toEqual({ ...workoutSetRecord, reps: 8 });
   });

   it('delegates remove to the service', async () => {
      workoutSetsServiceMock.remove.mockResolvedValue(workoutSetRecord);
      const result = await controller.remove(currentUser, workoutSetRecord.id);
      expect(workoutSetsServiceMock.remove).toHaveBeenCalledWith(
         currentUser,
         workoutSetRecord.id,
      );
      expect(result).toEqual(workoutSetRecord);
   });
});
