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

      it('rejects update of a template for regular users', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: currentUser.sub,
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

      it('rejects coach update when not owner and creator', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: currentUser.sub,
            createdById: coachUser.sub,
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

      it('rejects removing a template for regular users', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue({
            id: workoutPlanRecord.id,
            userId: null,
            createdById: currentUser.sub,
         });

         await expect(
            service.remove(currentUser, workoutPlanRecord.id),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.delete).not.toHaveBeenCalled();
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

      it('throws NotFoundException when removing a missing workout plan', async () => {
         prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

         await expect(
            service.remove(currentUser, 'missing_workoutPlan'),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutPlan.delete).not.toHaveBeenCalled();
      });
   });
});
