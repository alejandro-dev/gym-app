import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

type WorkoutPlanExerciseRecord = {
  id: string;
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

describe('WorkoutPlanExerciseService', () => {
  let service: WorkoutPlanExerciseService;
  const currentUser = {
    sub: 'user_123',
    email: 'user@example.com',
    role: UserRole.USER,
    tokenType: 'access' as const,
  };
  const adminUser = {
    sub: 'admin_123',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    tokenType: 'access' as const,
  };

  const prismaMock = {
    workoutPlanExercise: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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

  const workoutPlanExerciseRecord: WorkoutPlanExerciseRecord = {
    id: 'workoutPlanExercise_123',
    ...createWorkoutPlanExerciseDto,
  };

  const updatedWorkoutPlanExerciseRecord: WorkoutPlanExerciseRecord = {
    ...workoutPlanExerciseRecord,
    ...updatedWorkoutPlanExerciseDto,
    targetRepsMin: workoutPlanExerciseRecord.targetRepsMin,
    targetRepsMax: workoutPlanExerciseRecord.targetRepsMax,
    targetWeightKg: workoutPlanExerciseRecord.targetWeightKg,
    restSeconds: workoutPlanExerciseRecord.restSeconds,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlanExerciseService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<WorkoutPlanExerciseService>(
      WorkoutPlanExerciseService,
    );
  });

  describe('create', () => {
    it('creates a workout plan exercise and returns the public record', async () => {
      prismaMock.workoutPlanExercise.create.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await service.create(createWorkoutPlanExerciseDto);
      const [createArgs] = prismaMock.workoutPlanExercise.create.mock.calls[0];

      expect(createArgs.data).toEqual({
        workoutPlan: {
          connect: {
            id: createWorkoutPlanExerciseDto.workoutPlanId,
          },
        },
        exercise: {
          connect: {
            id: createWorkoutPlanExerciseDto.exerciseId,
          },
        },
        order: createWorkoutPlanExerciseDto.order,
        targetSets: createWorkoutPlanExerciseDto.targetSets,
        targetRepsMin: createWorkoutPlanExerciseDto.targetRepsMin,
        targetRepsMax: createWorkoutPlanExerciseDto.targetRepsMax,
        targetWeightKg: createWorkoutPlanExerciseDto.targetWeightKg,
        restSeconds: createWorkoutPlanExerciseDto.restSeconds,
        notes: createWorkoutPlanExerciseDto.notes,
      });
      expect(createArgs.select).toMatchObject({
        id: true,
        workoutPlanId: true,
        exerciseId: true,
        order: true,
        targetSets: true,
        targetRepsMin: true,
        targetRepsMax: true,
        targetWeightKg: true,
        restSeconds: true,
        notes: true,
      });
      expect(result).toEqual(workoutPlanExerciseRecord);
    });

    it('translates unexpected database errors into InternalServerErrorException', async () => {
      prismaMock.workoutPlanExercise.create.mockRejectedValue(
        new Error('db unavailable'),
      );

      await expect(
        service.create(createWorkoutPlanExerciseDto),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('returns only the authenticated user workout plan exercises when role is USER', async () => {
      const orderedWorkoutPlanExercises = [
        workoutPlanExerciseRecord,
        updatedWorkoutPlanExerciseRecord,
      ];

      prismaMock.workoutPlanExercise.findMany.mockResolvedValue(
        orderedWorkoutPlanExercises,
      );

      const result = await service.findAll(currentUser, undefined);
      const [findManyArgs] =
        prismaMock.workoutPlanExercise.findMany.mock.calls[0];

      expect(findManyArgs.select).toMatchObject({
        id: true,
        workoutPlanId: true,
        exerciseId: true,
        order: true,
        targetSets: true,
        targetRepsMin: true,
        targetRepsMax: true,
        targetWeightKg: true,
        restSeconds: true,
        notes: true,
      });
      expect(findManyArgs.orderBy).toEqual([
        { workoutPlanId: 'asc' },
        { order: 'asc' },
      ]);
      expect(findManyArgs.where).toEqual({
        workoutPlan: { userId: currentUser.sub },
      });
      expect(result).toEqual(orderedWorkoutPlanExercises);
    });

    it('allows privileged roles to filter by userId', async () => {
      prismaMock.workoutPlanExercise.findMany.mockResolvedValue([
        workoutPlanExerciseRecord,
      ]);

      await service.findAll(adminUser, 'target_user');
      const [findManyArgs] =
        prismaMock.workoutPlanExercise.findMany.mock.calls[0];

      expect(findManyArgs.where).toEqual({
        workoutPlan: { userId: 'target_user' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the workout plan exercise when it exists', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await service.findOne(
        currentUser,
        workoutPlanExerciseRecord.id,
      );
      const [findUniqueArgs] =
        prismaMock.workoutPlanExercise.findUnique.mock.calls[0];

      expect(findUniqueArgs.where).toEqual({
        id: workoutPlanExerciseRecord.id,
        workoutPlan: { userId: currentUser.sub },
      });
      expect(findUniqueArgs.select).toMatchObject({
        id: true,
        workoutPlanId: true,
        exerciseId: true,
        order: true,
        targetSets: true,
        targetRepsMin: true,
        targetRepsMax: true,
        targetWeightKg: true,
        restSeconds: true,
        notes: true,
      });
      expect(result).toEqual(workoutPlanExerciseRecord);
    });

    it('throws NotFoundException when the workout plan exercise does not exist', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(currentUser, 'missing_workoutPlanExercise'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('verifies existence, updates the workout plan exercise, and returns the updated record', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue({
        id: workoutPlanExerciseRecord.id,
      });
      prismaMock.workoutPlanExercise.update.mockResolvedValue(
        updatedWorkoutPlanExerciseRecord,
      );

      const result = await service.update(
        currentUser,
        workoutPlanExerciseRecord.id,
        updatedWorkoutPlanExerciseDto,
      );
      const [findUniqueArgs] =
        prismaMock.workoutPlanExercise.findUnique.mock.calls[0];
      const [updateArgs] = prismaMock.workoutPlanExercise.update.mock.calls[0];

      expect(findUniqueArgs).toEqual({
        where: {
          id: workoutPlanExerciseRecord.id,
          workoutPlan: { userId: currentUser.sub },
        },
        select: { id: true, workoutPlan: true },
      });
      expect(updateArgs.where).toEqual({
        id: workoutPlanExerciseRecord.id,
      });
      expect(updateArgs.data).toEqual({
        order: updatedWorkoutPlanExerciseDto.order,
        targetSets: updatedWorkoutPlanExerciseDto.targetSets,
        targetRepsMin: undefined,
        targetRepsMax: undefined,
        targetWeightKg: undefined,
        restSeconds: undefined,
        notes: updatedWorkoutPlanExerciseDto.notes,
      });
      expect(updateArgs.select).toMatchObject({
        id: true,
        workoutPlanId: true,
        exerciseId: true,
        order: true,
        targetSets: true,
        targetRepsMin: true,
        targetRepsMax: true,
        targetWeightKg: true,
        restSeconds: true,
        notes: true,
      });
      expect(result).toEqual(updatedWorkoutPlanExerciseRecord);
    });

    it('throws NotFoundException when updating a missing workout plan exercise', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue(null);

      await expect(
        service.update(
          currentUser,
          'missing_workoutPlanExercise',
          updatedWorkoutPlanExerciseDto,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.workoutPlanExercise.update).not.toHaveBeenCalled();
    });

    it('translates unexpected database errors into InternalServerErrorException', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue({
        id: workoutPlanExerciseRecord.id,
      });
      prismaMock.workoutPlanExercise.update.mockRejectedValue(
        new Error('db unavailable'),
      );

      await expect(
        service.update(
          currentUser,
          workoutPlanExerciseRecord.id,
          updatedWorkoutPlanExerciseDto,
        ),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('verifies existence and returns the deleted workout plan exercise', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue({
        id: workoutPlanExerciseRecord.id,
      });
      prismaMock.workoutPlanExercise.delete.mockResolvedValue(
        workoutPlanExerciseRecord,
      );

      const result = await service.remove(
        currentUser,
        workoutPlanExerciseRecord.id,
      );
      const [findUniqueArgs] =
        prismaMock.workoutPlanExercise.findUnique.mock.calls[0];
      const [deleteArgs] = prismaMock.workoutPlanExercise.delete.mock.calls[0];

      expect(findUniqueArgs).toEqual({
        where: {
          id: workoutPlanExerciseRecord.id,
          workoutPlan: { userId: currentUser.sub },
        },
        select: { id: true, workoutPlan: true },
      });
      expect(deleteArgs.where).toEqual({
        id: workoutPlanExerciseRecord.id,
      });
      expect(deleteArgs.select).toMatchObject({
        id: true,
        workoutPlanId: true,
        exerciseId: true,
        order: true,
        targetSets: true,
        targetRepsMin: true,
        targetRepsMax: true,
        targetWeightKg: true,
        restSeconds: true,
        notes: true,
      });
      expect(result).toEqual(workoutPlanExerciseRecord);
    });

    it('throws NotFoundException when removing a missing workout plan exercise', async () => {
      prismaMock.workoutPlanExercise.findUnique.mockResolvedValue(null);

      await expect(
        service.remove(currentUser, 'missing_workoutPlanExercise'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.workoutPlanExercise.delete).not.toHaveBeenCalled();
    });
  });
});
