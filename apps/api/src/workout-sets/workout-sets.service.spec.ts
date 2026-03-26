import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { WorkoutSetsService } from './workout-sets.service';
import { PrismaService } from '../prisma/prisma.service';
import {
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';

type CreateWorkoutSetDto = {
   workoutSessionId: string;
   exerciseId: string;
   setNumber: number;
   reps: number | null;
   weightKg: number | null;
   durationSeconds: number | null;
   distanceMeters: number | null;
   rir: number | null;
   isWarmup: boolean;
   isCompleted: boolean;
};

type UpdateWorkoutSetDto = Partial<
   Omit<CreateWorkoutSetDto, 'workoutSessionId' | 'exerciseId'>
>;

type WorkoutSetRecord = {
   id: string;
   workoutSessionId: string;
   exerciseId: string;
   setNumber: number;
   reps: number | null;
   weightKg: number | null;
   durationSeconds: number | null;
   distanceMeters: number | null;
   rir: number | null;
   isWarmup: boolean;
   isCompleted: boolean;
   createdAt: Date;
};

describe('WorkoutSetsService', () => {
   let service: WorkoutSetsService;
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
      workoutSet: {
         create: jest.fn<
            Promise<WorkoutSetRecord>,
            [Prisma.WorkoutSetCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<WorkoutSetRecord[]>,
            [Prisma.WorkoutSetFindManyArgs]
         >(),
         findUnique: jest.fn<
            Promise<WorkoutSetRecord | { id: string } | null>,
            [Prisma.WorkoutSetFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<WorkoutSetRecord>,
            [Prisma.WorkoutSetUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<WorkoutSetRecord>,
            [Prisma.WorkoutSetDeleteArgs]
         >(),
      },
   };

   const createWorkoutSetDto: CreateWorkoutSetDto = {
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

   const updatedWorkoutSetDto: UpdateWorkoutSetDto = {
      setNumber: 2,
      reps: 8,
      weightKg: 82.5,
   };

   const workoutSetRecord: WorkoutSetRecord = {
      id: 'workoutSet_123',
      ...createWorkoutSetDto,
      createdAt: new Date('2026-03-23T10:00:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            WorkoutSetsService,
            {
               provide: PrismaService,
               useValue: prismaMock,
            },
         ],
      }).compile();

      service = module.get<WorkoutSetsService>(WorkoutSetsService);
   });

   describe('create', () => {
      it('creates a workout set and returns the public record', async () => {
         prismaMock.workoutSet.create.mockResolvedValue(workoutSetRecord);

         const result = await service.create(createWorkoutSetDto);
         const [createArgs] = prismaMock.workoutSet.create.mock.calls[0];

         expect(createArgs.data).toEqual({
            workoutSession: {
               connect: {
                  id: createWorkoutSetDto.workoutSessionId,
               },
            },
            exercise: {
               connect: {
                  id: createWorkoutSetDto.exerciseId,
               },
            },
            setNumber: createWorkoutSetDto.setNumber,
            reps: createWorkoutSetDto.reps,
            weightKg: createWorkoutSetDto.weightKg,
            durationSeconds: createWorkoutSetDto.durationSeconds,
            distanceMeters: createWorkoutSetDto.distanceMeters,
            rir: createWorkoutSetDto.rir,
            isWarmup: createWorkoutSetDto.isWarmup,
            isCompleted: createWorkoutSetDto.isCompleted,
         });
         expect(createArgs.select).toMatchObject({
            id: true,
            workoutSessionId: true,
            exerciseId: true,
            setNumber: true,
            createdAt: true,
         });
         expect(result).toEqual(workoutSetRecord);
      });

      it('translates unexpected database errors into InternalServerErrorException', async () => {
         prismaMock.workoutSet.create.mockRejectedValue(
            new Error('db unavailable'),
         );

         await expect(
            service.create(createWorkoutSetDto),
         ).rejects.toBeInstanceOf(InternalServerErrorException);
      });
   });

   describe('findAll', () => {
      it('returns only the authenticated user workout sets when role is USER', async () => {
         prismaMock.workoutSet.findMany.mockResolvedValue([workoutSetRecord]);

         const result = await service.findAll(currentUser, undefined);
         const [findManyArgs] = prismaMock.workoutSet.findMany.mock.calls[0];

         expect(findManyArgs.select).toMatchObject({
            id: true,
            workoutSessionId: true,
            exerciseId: true,
            setNumber: true,
            createdAt: true,
         });
         expect(findManyArgs.orderBy).toEqual([
            { workoutSessionId: 'asc' },
            { exerciseId: 'asc' },
            { setNumber: 'asc' },
         ]);
         expect(findManyArgs.where).toEqual({
            workoutSession: { userId: currentUser.sub },
         });
         expect(result).toEqual([workoutSetRecord]);
      });

      it('allows privileged roles to filter by userId', async () => {
         prismaMock.workoutSet.findMany.mockResolvedValue([workoutSetRecord]);

         await service.findAll(adminUser, 'target_user');
         const [findManyArgs] = prismaMock.workoutSet.findMany.mock.calls[0];

         expect(findManyArgs.where).toEqual({
            workoutSession: { userId: 'target_user' },
         });
      });
   });

   describe('findOne', () => {
      it('returns the workout set when it exists', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue(workoutSetRecord);

         const result = await service.findOne(currentUser, workoutSetRecord.id);
         const [findUniqueArgs] =
            prismaMock.workoutSet.findUnique.mock.calls[0];

         expect(findUniqueArgs.where).toEqual({
            id: workoutSetRecord.id,
            workoutSession: { userId: currentUser.sub },
         });
         expect(findUniqueArgs.select).toMatchObject({
            id: true,
            workoutSessionId: true,
            exerciseId: true,
         });
         expect(result).toEqual(workoutSetRecord);
      });

      it('throws NotFoundException when the workout set does not exist', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue(null);

         await expect(
            service.findOne(currentUser, 'missing_workoutSet'),
         ).rejects.toBeInstanceOf(NotFoundException);
      });
   });

   describe('update', () => {
      it('verifies existence, updates the workout set, and returns the updated record', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue({
            id: workoutSetRecord.id,
         });
         prismaMock.workoutSet.update.mockResolvedValue({
            ...workoutSetRecord,
            ...updatedWorkoutSetDto,
         });

         const result = await service.update(
            currentUser,
            workoutSetRecord.id,
            updatedWorkoutSetDto,
         );
         const [findUniqueArgs] =
            prismaMock.workoutSet.findUnique.mock.calls[0];
         const [updateArgs] = prismaMock.workoutSet.update.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: {
               id: workoutSetRecord.id,
               workoutSession: { userId: currentUser.sub },
            },
            select: { id: true },
         });
         expect(updateArgs.where).toEqual({ id: workoutSetRecord.id });
         expect(updateArgs.data).toEqual({
            setNumber: updatedWorkoutSetDto.setNumber,
            reps: updatedWorkoutSetDto.reps,
            weightKg: updatedWorkoutSetDto.weightKg,
            durationSeconds: undefined,
            distanceMeters: undefined,
            rir: undefined,
            isWarmup: undefined,
            isCompleted: undefined,
         });
         expect(updateArgs.select).toBeDefined();
         expect(result).toEqual({
            ...workoutSetRecord,
            ...updatedWorkoutSetDto,
         });
      });

      it('throws NotFoundException when updating a missing workout set', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue(null);

         await expect(
            service.update(
               currentUser,
               'missing_workoutSet',
               updatedWorkoutSetDto,
            ),
         ).rejects.toBeInstanceOf(NotFoundException);
      });
   });

   describe('remove', () => {
      it('verifies existence and returns the deleted workout set', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue({
            id: workoutSetRecord.id,
         });
         prismaMock.workoutSet.delete.mockResolvedValue(workoutSetRecord);

         const result = await service.remove(currentUser, workoutSetRecord.id);
         const [findUniqueArgs] =
            prismaMock.workoutSet.findUnique.mock.calls[0];
         const [deleteArgs] = prismaMock.workoutSet.delete.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: {
               id: workoutSetRecord.id,
               workoutSession: { userId: currentUser.sub },
            },
            select: { id: true },
         });
         expect(deleteArgs.where).toEqual({ id: workoutSetRecord.id });
         expect(deleteArgs.select).toBeDefined();
         expect(result).toEqual(workoutSetRecord);
      });

      it('throws NotFoundException when removing a missing workout set', async () => {
         prismaMock.workoutSet.findUnique.mockResolvedValue(null);

         await expect(
            service.remove(currentUser, 'missing_workoutSet'),
         ).rejects.toBeInstanceOf(NotFoundException);
      });
   });
});
