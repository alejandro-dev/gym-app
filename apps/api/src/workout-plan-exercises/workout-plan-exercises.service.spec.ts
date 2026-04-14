import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';
import { PrismaService } from '../prisma/prisma.service';
import {
   ConflictException,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';

type CreateWorkoutPlanExerciseDto = {
   workoutPlanId: string;
   exerciseId: string;
   day?: number | null;
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
   day: number | null;
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
         create: jest.fn<
            Promise<WorkoutPlanExerciseRecord>,
            [Prisma.WorkoutPlanExerciseCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<WorkoutPlanExerciseRecord[]>,
            [Prisma.WorkoutPlanExerciseFindManyArgs]
         >(),
         findFirst: jest.fn<
            Promise<{ id: string } | null>,
            [Prisma.WorkoutPlanExerciseFindFirstArgs]
         >(),
         findUnique: jest.fn<
            Promise<
               | WorkoutPlanExerciseRecord
               | {
                    id: string;
                    workoutPlanId: string;
                    day: number | null;
                    order: number;
                 }
               | null
            >,
            [Prisma.WorkoutPlanExerciseFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<WorkoutPlanExerciseRecord>,
            [Prisma.WorkoutPlanExerciseUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<WorkoutPlanExerciseRecord>,
            [Prisma.WorkoutPlanExerciseDeleteArgs]
         >(),
      },
   };

   const createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto = {
      workoutPlanId: 'workoutPlan_123',
      exerciseId: 'exercise_123',
      day: null,
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
      day: createWorkoutPlanExerciseDto.day ?? null,
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
      prismaMock.workoutPlanExercise.findFirst.mockResolvedValue(null);

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
         const [createArgs] =
            prismaMock.workoutPlanExercise.create.mock.calls[0];

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
            day: createWorkoutPlanExerciseDto.day,
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
            day: true,
            targetSets: true,
            targetRepsMin: true,
            targetRepsMax: true,
            targetWeightKg: true,
            restSeconds: true,
            notes: true,
         });
         expect(result).toEqual(workoutPlanExerciseRecord);
      });

      it('throws ConflictException when creating a duplicate position without a day', async () => {
         prismaMock.workoutPlanExercise.findFirst.mockResolvedValue({
            id: 'existing_workoutPlanExercise',
         });

         await expect(
            service.create(createWorkoutPlanExerciseDto),
         ).rejects.toBeInstanceOf(ConflictException);
         expect(prismaMock.workoutPlanExercise.findFirst).toHaveBeenCalledWith({
            where: {
               workoutPlanId: createWorkoutPlanExerciseDto.workoutPlanId,
               day: null,
               order: createWorkoutPlanExerciseDto.order,
            },
            select: { id: true },
         });
         expect(prismaMock.workoutPlanExercise.create).not.toHaveBeenCalled();
      });

      it('allows the same order on a different day', async () => {
         prismaMock.workoutPlanExercise.create.mockResolvedValue({
            ...workoutPlanExerciseRecord,
            day: 2,
         });

         await service.create({
            ...createWorkoutPlanExerciseDto,
            day: 2,
         });

         expect(prismaMock.workoutPlanExercise.findFirst).toHaveBeenCalledWith({
            where: {
               workoutPlanId: createWorkoutPlanExerciseDto.workoutPlanId,
               day: 2,
               order: createWorkoutPlanExerciseDto.order,
            },
            select: { id: true },
         });
         expect(prismaMock.workoutPlanExercise.create).toHaveBeenCalled();
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
            { day: 'asc' },
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
            workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
            day: workoutPlanExerciseRecord.day,
            order: workoutPlanExerciseRecord.order,
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
         const [updateArgs] =
            prismaMock.workoutPlanExercise.update.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: {
               id: workoutPlanExerciseRecord.id,
               workoutPlan: { userId: currentUser.sub },
            },
            select: {
               id: true,
               workoutPlanId: true,
               day: true,
               order: true,
               workoutPlan: true,
            },
         });
         expect(prismaMock.workoutPlanExercise.findFirst).toHaveBeenCalledWith({
            where: {
               workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
               day: null,
               order: updatedWorkoutPlanExerciseDto.order,
               id: {
                  not: workoutPlanExerciseRecord.id,
               },
            },
            select: { id: true },
         });
         expect(updateArgs.where).toEqual({
            id: workoutPlanExerciseRecord.id,
         });
         expect(updateArgs.data).toEqual({
            exercise: undefined,
            order: updatedWorkoutPlanExerciseDto.order,
            day: undefined,
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
            day: true,
            targetSets: true,
            targetRepsMin: true,
            targetRepsMax: true,
            targetWeightKg: true,
            restSeconds: true,
            notes: true,
         });
         expect(result).toEqual(updatedWorkoutPlanExerciseRecord);
      });

      it('throws ConflictException when updating to a duplicate position', async () => {
         prismaMock.workoutPlanExercise.findUnique.mockResolvedValue({
            id: workoutPlanExerciseRecord.id,
            workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
            day: workoutPlanExerciseRecord.day,
            order: workoutPlanExerciseRecord.order,
         });
         prismaMock.workoutPlanExercise.findFirst.mockResolvedValue({
            id: 'existing_workoutPlanExercise',
         });

         await expect(
            service.update(currentUser, workoutPlanExerciseRecord.id, {
               order: 2,
            }),
         ).rejects.toBeInstanceOf(ConflictException);
         expect(prismaMock.workoutPlanExercise.update).not.toHaveBeenCalled();
      });

      it('does not check position conflicts when day and order do not change', async () => {
         prismaMock.workoutPlanExercise.findUnique.mockResolvedValue({
            id: workoutPlanExerciseRecord.id,
            workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
            day: workoutPlanExerciseRecord.day,
            order: workoutPlanExerciseRecord.order,
         });
         prismaMock.workoutPlanExercise.update.mockResolvedValue({
            ...workoutPlanExerciseRecord,
            notes: 'Only notes changed',
         });

         await service.update(currentUser, workoutPlanExerciseRecord.id, {
            notes: 'Only notes changed',
         });

         expect(
            prismaMock.workoutPlanExercise.findFirst,
         ).not.toHaveBeenCalled();
         expect(prismaMock.workoutPlanExercise.update).toHaveBeenCalled();
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
            workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
            day: workoutPlanExerciseRecord.day,
            order: workoutPlanExerciseRecord.order,
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
            workoutPlanId: workoutPlanExerciseRecord.workoutPlanId,
            day: workoutPlanExerciseRecord.day,
            order: workoutPlanExerciseRecord.order,
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
         const [deleteArgs] =
            prismaMock.workoutPlanExercise.delete.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: {
               id: workoutPlanExerciseRecord.id,
               workoutPlan: { userId: currentUser.sub },
            },
            select: {
               id: true,
               workoutPlanId: true,
               day: true,
               order: true,
               workoutPlan: true,
            },
         });
         expect(deleteArgs.where).toEqual({
            id: workoutPlanExerciseRecord.id,
         });
         expect(deleteArgs.select).toMatchObject({
            id: true,
            workoutPlanId: true,
            exerciseId: true,
            order: true,
            day: true,
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
