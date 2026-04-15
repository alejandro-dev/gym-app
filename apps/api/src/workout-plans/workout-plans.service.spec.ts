import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { WorkoutPlansService } from './workout-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import {
   BadRequestException,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';

type CreateWorkoutPlanDto = {
   userId?: string | null;
   name: string;
   description: string | null;
   isActive: boolean;
   type?: 'new' | 'copy' | null;
   sourceWorkoutPlanId?: string | null;
};

type UpdateWorkoutPlanDto = Partial<CreateWorkoutPlanDto>;

type WorkoutPlanRecord = {
   id: string;
   userId: string | null;
   user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
   } | null;
   createdById: string;
   name: string;
   description: string | null;
   goal: null;
   level: null;
   durationWeeks: null;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
};

type WorkoutPlanExerciseCopyRecord = {
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

describe('WorkoutPlansService', () => {
   let service: WorkoutPlansService;
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
   const coachUser = {
      sub: 'coach_123',
      email: 'coach@example.com',
      role: UserRole.COACH,
      tokenType: 'access' as const,
   };

   const prismaMock = {
      $transaction: jest.fn(),
      workoutPlan: {
         create: jest.fn<
            Promise<WorkoutPlanRecord>,
            [Prisma.WorkoutPlanCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<WorkoutPlanRecord[]>,
            [Prisma.WorkoutPlanFindManyArgs]
         >(),
         count: jest.fn<Promise<number>, [Prisma.WorkoutPlanCountArgs]>(),
         findUnique: jest.fn<
            Promise<WorkoutPlanRecord | { id: string } | null>,
            [Prisma.WorkoutPlanFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<WorkoutPlanRecord>,
            [Prisma.WorkoutPlanUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<WorkoutPlanRecord>,
            [Prisma.WorkoutPlanDeleteArgs]
         >(),
      },
      workoutPlanExercise: {
         findMany: jest.fn<
            Promise<WorkoutPlanExerciseCopyRecord[]>,
            [Prisma.WorkoutPlanExerciseFindManyArgs]
         >(),
         createMany: jest.fn<
            Promise<Prisma.BatchPayload>,
            [Prisma.WorkoutPlanExerciseCreateManyArgs]
         >(),
      },
   };

   const createWorkoutPlanDto: CreateWorkoutPlanDto = {
      userId: 'user_123',
      name: 'Plan de trabajo',
      description: 'Descripción del plan de trabajo',
      isActive: true,
   };

   const updatedWorkoutPlanDto: UpdateWorkoutPlanDto = {
      name: 'Plan de trabajo actualizado',
      description: 'Descripción actualizada del plan de trabajo',
   };

   const workoutPlanRecord: WorkoutPlanRecord = {
      id: 'workoutPlan_123',
      ...createWorkoutPlanDto,
      userId: createWorkoutPlanDto.userId ?? null,
      user: {
         email: currentUser.email,
         firstName: 'Current',
         lastName: 'User',
      },
      createdById: currentUser.sub,
      goal: null,
      level: null,
      durationWeeks: null,
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      updatedAt: new Date('2026-03-21T10:00:00.000Z'),
   };

   const updatedWorkoutPlanRecord: WorkoutPlanRecord = {
      ...workoutPlanRecord,
      ...updatedWorkoutPlanDto,
      updatedAt: new Date('2026-03-21T11:00:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();
      prismaMock.$transaction.mockImplementation(
         async <T>(callback: (tx: typeof prismaMock) => Promise<T>) =>
            callback(prismaMock),
      );

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            WorkoutPlansService,
            {
               provide: PrismaService,
               useValue: prismaMock,
            },
         ],
      }).compile();

      service = module.get<WorkoutPlansService>(WorkoutPlansService);
   });

   describe('create', () => {
      it('creates a workout plan and returns the public record', async () => {
         prismaMock.workoutPlan.create.mockResolvedValue(workoutPlanRecord);

         const result = await service.create(currentUser, createWorkoutPlanDto);
         const [createArgs] = prismaMock.workoutPlan.create.mock.calls[0];

         expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
         expect(createArgs.data).toEqual({
            name: createWorkoutPlanDto.name,
            description: createWorkoutPlanDto.description,
            isActive: createWorkoutPlanDto.isActive,
            goal: undefined,
            level: undefined,
            durationWeeks: undefined,
            user: {
               connect: {
                  id: createWorkoutPlanDto.userId,
               },
            },
            createdBy: {
               connect: {
                  id: currentUser.sub,
               },
            },
         });
         expect(createArgs.select).toMatchObject({
            id: true,
            userId: true,
            createdById: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toMatchObject({
            ...workoutPlanRecord,
            createdAt: workoutPlanRecord.createdAt.toISOString(),
            updatedAt: workoutPlanRecord.updatedAt.toISOString(),
         });
         expect(prismaMock.workoutPlanExercise.findMany).not.toHaveBeenCalled();
         expect(
            prismaMock.workoutPlanExercise.createMany,
         ).not.toHaveBeenCalled();
      });

      it('creates a template without an owner for privileged roles', async () => {
         const templateRecord: WorkoutPlanRecord = {
            ...workoutPlanRecord,
            userId: null,
            user: null,
            createdById: coachUser.sub,
         };
         prismaMock.workoutPlan.create.mockResolvedValue(templateRecord);

         const result = await service.create(coachUser, {
            ...createWorkoutPlanDto,
            userId: null,
         });
         const [createArgs] = prismaMock.workoutPlan.create.mock.calls[0];

         expect(createArgs.data).not.toHaveProperty('user');
         expect(createArgs.data).toMatchObject({
            name: createWorkoutPlanDto.name,
            createdBy: {
               connect: {
                  id: coachUser.sub,
               },
            },
         });
         expect(result).toMatchObject({
            userId: null,
            user: null,
            createdById: coachUser.sub,
         });
      });

      it('copies workout plan exercises when creating from another plan', async () => {
         const copiedWorkoutPlanRecord: WorkoutPlanRecord = {
            ...workoutPlanRecord,
            id: 'workoutPlan_copy',
            name: 'Plan de trabajo copia',
            createdById: coachUser.sub,
         };
         const sourceWorkoutPlanExercises: WorkoutPlanExerciseCopyRecord[] = [
            {
               exerciseId: 'exercise_1',
               day: 1,
               order: 1,
               targetSets: 4,
               targetRepsMin: 8,
               targetRepsMax: 10,
               targetWeightKg: 80,
               restSeconds: 120,
               notes: 'Mantener tecnica',
            },
            {
               exerciseId: 'exercise_2',
               day: 1,
               order: 2,
               targetSets: 3,
               targetRepsMin: 10,
               targetRepsMax: 12,
               targetWeightKg: null,
               restSeconds: 90,
               notes: null,
            },
         ];

         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: coachUser.sub,
         });
         prismaMock.workoutPlan.create.mockResolvedValue(
            copiedWorkoutPlanRecord,
         );
         prismaMock.workoutPlanExercise.findMany.mockResolvedValue(
            sourceWorkoutPlanExercises,
         );
         prismaMock.workoutPlanExercise.createMany.mockResolvedValue({
            count: sourceWorkoutPlanExercises.length,
         });

         const result = await service.create(coachUser, {
            ...createWorkoutPlanDto,
            name: copiedWorkoutPlanRecord.name,
            type: 'copy',
            sourceWorkoutPlanId: workoutPlanRecord.id,
         });

         expect(prismaMock.workoutPlan.findUnique).toHaveBeenCalledWith({
            where: { id: workoutPlanRecord.id },
            select: { id: true, userId: true, createdById: true },
         });
         expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
         expect(prismaMock.workoutPlanExercise.findMany).toHaveBeenCalledWith({
            where: { workoutPlanId: workoutPlanRecord.id },
            select: {
               exerciseId: true,
               day: true,
               order: true,
               targetSets: true,
               targetRepsMin: true,
               targetRepsMax: true,
               targetWeightKg: true,
               restSeconds: true,
               notes: true,
            },
         });
         expect(prismaMock.workoutPlanExercise.createMany).toHaveBeenCalledWith(
            {
               data: sourceWorkoutPlanExercises.map((sourceExercise) => ({
                  workoutPlanId: copiedWorkoutPlanRecord.id,
                  ...sourceExercise,
               })),
            },
         );
         expect(result).toMatchObject({
            id: copiedWorkoutPlanRecord.id,
            name: copiedWorkoutPlanRecord.name,
         });
      });

      it('rejects copying a workout plan without a source id', async () => {
         await expect(
            service.create(coachUser, {
               ...createWorkoutPlanDto,
               type: 'copy',
               sourceWorkoutPlanId: null,
            }),
         ).rejects.toBeInstanceOf(BadRequestException);
         expect(prismaMock.$transaction).not.toHaveBeenCalled();
         expect(prismaMock.workoutPlan.create).not.toHaveBeenCalled();
      });

      it('rejects copying a missing workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

         await expect(
            service.create(coachUser, {
               ...createWorkoutPlanDto,
               type: 'copy',
               sourceWorkoutPlanId: 'missing_workoutPlan',
            }),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.$transaction).not.toHaveBeenCalled();
         expect(prismaMock.workoutPlan.create).not.toHaveBeenCalled();
      });

      it('rejects copying a workout plan that the user cannot access', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: 'another_coach',
         });

         await expect(
            service.create(coachUser, {
               ...createWorkoutPlanDto,
               type: 'copy',
               sourceWorkoutPlanId: workoutPlanRecord.id,
            }),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.$transaction).not.toHaveBeenCalled();
         expect(prismaMock.workoutPlan.create).not.toHaveBeenCalled();
      });

      it('translates unexpected database errors into InternalServerErrorException', async () => {
         prismaMock.workoutPlan.create.mockRejectedValue(
            new Error('db unavailable'),
         );

         await expect(
            service.create(currentUser, createWorkoutPlanDto),
         ).rejects.toBeInstanceOf(InternalServerErrorException);
      });

      it('rejects creating a workout plan for another user when role is USER', async () => {
         await expect(
            service.create(currentUser, {
               ...createWorkoutPlanDto,
               userId: 'another_user',
            }),
         ).rejects.toThrow(
            'A user can only create workout plans for themselves.',
         );
         expect(prismaMock.workoutPlan.create).not.toHaveBeenCalled();
      });

      it('rejects creating a template when role is USER', async () => {
         await expect(
            service.create(currentUser, {
               ...createWorkoutPlanDto,
               userId: null,
            }),
         ).rejects.toBeInstanceOf(BadRequestException);
         expect(prismaMock.workoutPlan.create).not.toHaveBeenCalled();
      });
   });

   describe('findAll', () => {
      it('returns only the authenticated user workout plans when role is USER', async () => {
         const orderedWorkoutPlans = [
            updatedWorkoutPlanRecord,
            workoutPlanRecord,
         ];

         prismaMock.workoutPlan.findMany.mockResolvedValue(orderedWorkoutPlans);
         prismaMock.workoutPlan.count.mockResolvedValue(
            orderedWorkoutPlans.length,
         );

         const result = await service.findAll(currentUser, 0, 10, '');
         const [findManyArgs] = prismaMock.workoutPlan.findMany.mock.calls[0];

         expect(findManyArgs.select).toMatchObject({
            id: true,
            userId: true,
            createdById: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(findManyArgs.orderBy).toEqual({
            createdAt: 'desc',
         });
         expect(findManyArgs.where).toEqual({ userId: currentUser.sub });
         expect(result).toMatchObject({
            total: orderedWorkoutPlans.length,
            page: 0,
            limit: 10,
         });
         expect(Array.isArray(result.items)).toBe(true);
      });

      it('allows privileged roles to filter by userId', async () => {
         prismaMock.workoutPlan.findMany.mockResolvedValue([workoutPlanRecord]);
         prismaMock.workoutPlan.count.mockResolvedValue(1);

         await service.findAll(adminUser, 0, 10, '', 'target_user');
         const [findManyArgs] = prismaMock.workoutPlan.findMany.mock.calls[0];

         expect(findManyArgs.where).toEqual({ userId: 'target_user' });
      });

      it('returns coach-authored plans by default for role COACH', async () => {
         prismaMock.workoutPlan.findMany.mockResolvedValue([workoutPlanRecord]);
         prismaMock.workoutPlan.count.mockResolvedValue(1);

         await service.findAll(coachUser, 0, 10, '');
         const [findManyArgs] = prismaMock.workoutPlan.findMany.mock.calls[0];

         expect(findManyArgs.where).toEqual({ createdById: coachUser.sub });
      });
   });

   describe('findOne', () => {
      it('returns the workout plan when it exists', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(workoutPlanRecord);

         const result = await service.findOne(
            currentUser,
            workoutPlanRecord.id,
         );
         const [findUniqueArgs] =
            prismaMock.workoutPlan.findUnique.mock.calls[0];

         expect(findUniqueArgs.where).toEqual({
            id: workoutPlanRecord.id,
         });
         expect(findUniqueArgs.select).toMatchObject({
            id: true,
            userId: true,
            createdById: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toMatchObject({
            ...workoutPlanRecord,
            createdAt: workoutPlanRecord.createdAt.toISOString(),
            updatedAt: workoutPlanRecord.updatedAt.toISOString(),
         });
      });

      it('throws NotFoundException when the workout plan does not exist', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

         await expect(
            service.findOne(currentUser, 'missing_workoutPlan'),
         ).rejects.toBeInstanceOf(NotFoundException);
      });
   });

   describe('update', () => {
      it('verifies existence, updates the workout plan, and returns the updated record', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: workoutPlanRecord.userId,
            createdById: workoutPlanRecord.createdById,
         });
         prismaMock.workoutPlan.update.mockResolvedValue(
            updatedWorkoutPlanRecord,
         );

         const result = await service.update(
            currentUser,
            workoutPlanRecord.id,
            updatedWorkoutPlanDto,
         );
         const [findUniqueArgs] =
            prismaMock.workoutPlan.findUnique.mock.calls[0];
         const [updateArgs] = prismaMock.workoutPlan.update.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: workoutPlanRecord.id },
            select: { id: true, userId: true, createdById: true },
         });
         expect(updateArgs.where).toEqual({ id: workoutPlanRecord.id });
         expect(updateArgs.data).toEqual({
            name: updatedWorkoutPlanDto.name,
            description: updatedWorkoutPlanDto.description,
            isActive: undefined,
            goal: undefined,
            level: undefined,
            durationWeeks: undefined,
         });
         expect(updateArgs.select).toMatchObject({
            id: true,
            userId: true,
            createdById: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toMatchObject({
            ...updatedWorkoutPlanRecord,
            createdAt: updatedWorkoutPlanRecord.createdAt.toISOString(),
            updatedAt: updatedWorkoutPlanRecord.updatedAt.toISOString(),
         });
      });

      it('rejects update when user is assigned but did not create the plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });

         await expect(
            service.update(
               currentUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.update).not.toHaveBeenCalled();
      });

      it('allows the creator to update an unassigned workout plan', async () => {
         const unassignedUpdatedRecord: WorkoutPlanRecord = {
            ...updatedWorkoutPlanRecord,
            userId: null,
            user: null,
            createdById: currentUser.sub,
         };

         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: currentUser.sub,
         });
         prismaMock.workoutPlan.update.mockResolvedValue(
            unassignedUpdatedRecord,
         );

         await expect(
            service.update(
               currentUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).resolves.toMatchObject({
            id: unassignedUpdatedRecord.id,
            userId: null,
            createdById: currentUser.sub,
         });
         expect(prismaMock.workoutPlan.update).toHaveBeenCalled();
      });

      it('allows admin to update any workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         prismaMock.workoutPlan.update.mockResolvedValue(
            updatedWorkoutPlanRecord,
         );

         await expect(
            service.update(
               adminUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).resolves.toMatchObject({
            id: updatedWorkoutPlanRecord.id,
         });
         expect(prismaMock.workoutPlan.update).toHaveBeenCalled();
      });

      it('allows a coach creator to update a plan assigned to another user', async () => {
         const coachUpdatedRecord: WorkoutPlanRecord = {
            ...updatedWorkoutPlanRecord,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         };

         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         prismaMock.workoutPlan.update.mockResolvedValue(coachUpdatedRecord);

         await expect(
            service.update(
               coachUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).resolves.toMatchObject({
            id: coachUpdatedRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         expect(prismaMock.workoutPlan.update).toHaveBeenCalled();
      });

      it('rejects coach update when they did not create the plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: 'another_coach',
         });

         await expect(
            service.update(
               coachUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.update).not.toHaveBeenCalled();
      });

      it('throws NotFoundException when updating a missing workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

         await expect(
            service.update(
               currentUser,
               'missing_workoutPlan',
               updatedWorkoutPlanDto,
            ),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.update).not.toHaveBeenCalled();
      });

      it('translates unexpected database errors into InternalServerErrorException', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: workoutPlanRecord.userId,
            createdById: workoutPlanRecord.createdById,
         });
         prismaMock.workoutPlan.update.mockRejectedValue(
            new Error('db unavailable'),
         );

         await expect(
            service.update(
               currentUser,
               workoutPlanRecord.id,
               updatedWorkoutPlanDto,
            ),
         ).rejects.toBeInstanceOf(InternalServerErrorException);
      });
   });

   describe('remove', () => {
      it('verifies existence and returns the deleted workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: workoutPlanRecord.userId,
            createdById: workoutPlanRecord.createdById,
         });
         prismaMock.workoutPlan.delete.mockResolvedValue(workoutPlanRecord);

         const result = await service.remove(currentUser, workoutPlanRecord.id);
         const [findUniqueArgs] =
            prismaMock.workoutPlan.findUnique.mock.calls[0];
         const [deleteArgs] = prismaMock.workoutPlan.delete.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: workoutPlanRecord.id },
            select: { id: true, userId: true, createdById: true },
         });
         expect(deleteArgs.where).toEqual({ id: workoutPlanRecord.id });
         expect(deleteArgs.select).toMatchObject({
            id: true,
            userId: true,
            createdById: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toMatchObject({
            ...workoutPlanRecord,
            createdAt: workoutPlanRecord.createdAt.toISOString(),
            updatedAt: workoutPlanRecord.updatedAt.toISOString(),
         });
      });

      it('rejects remove when user is assigned but did not create the plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });

         await expect(
            service.remove(currentUser, workoutPlanRecord.id),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.delete).not.toHaveBeenCalled();
      });

      it('allows the creator to remove an unassigned workout plan', async () => {
         const unassignedRecord: WorkoutPlanRecord = {
            ...workoutPlanRecord,
            userId: null,
            user: null,
            createdById: currentUser.sub,
         };

         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: currentUser.sub,
         });
         prismaMock.workoutPlan.delete.mockResolvedValue(unassignedRecord);

         await expect(
            service.remove(currentUser, workoutPlanRecord.id),
         ).resolves.toMatchObject({
            id: unassignedRecord.id,
            userId: null,
            createdById: currentUser.sub,
         });
         expect(prismaMock.workoutPlan.delete).toHaveBeenCalled();
      });

      it('allows admin to remove any workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         prismaMock.workoutPlan.delete.mockResolvedValue(workoutPlanRecord);

         await expect(
            service.remove(adminUser, workoutPlanRecord.id),
         ).resolves.toMatchObject({
            id: workoutPlanRecord.id,
         });
         expect(prismaMock.workoutPlan.delete).toHaveBeenCalled();
      });

      it('allows a coach creator to remove a plan assigned to another user', async () => {
         const coachOwnedRecord: WorkoutPlanRecord = {
            ...workoutPlanRecord,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         };

         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         prismaMock.workoutPlan.delete.mockResolvedValue(coachOwnedRecord);

         await expect(
            service.remove(coachUser, workoutPlanRecord.id),
         ).resolves.toMatchObject({
            id: coachOwnedRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
         });
         expect(prismaMock.workoutPlan.delete).toHaveBeenCalled();
      });

      it('throws NotFoundException when removing a missing workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

         await expect(
            service.remove(currentUser, 'missing_workoutPlan'),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.delete).not.toHaveBeenCalled();
      });
   });
});
