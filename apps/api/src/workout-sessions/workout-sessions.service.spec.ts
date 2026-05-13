import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import type { WorkoutSession } from '@gym-app/types';
import { WorkoutSessionsService } from './workout-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutProducer } from '../bullmq/workout/workout.producer';
import {
   ConflictException,
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';

type CreateWorkoutSessionDto = {
   userId: string;
   workoutPlanId?: string | null;
   name: string;
   notes?: string | null;
   startedAt: string;
   endedAt?: string | null;
};

type UpdateWorkoutSessionDto = Partial<
   Omit<CreateWorkoutSessionDto, 'userId' | 'startedAt'>
>;

type WorkoutSessionRecord = {
   id: string;
   userId: string;
   workoutPlanId: string | null;
   name: string;
   notes: string | null;
   startedAt: Date;
   endedAt: Date | null;
   sets: Array<{
      reps: number | null;
      weightKg: number | null;
   }>;
};

describe('WorkoutSessionsService', () => {
   let service: WorkoutSessionsService;
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
      workoutSession: {
         create: jest.fn<
            Promise<WorkoutSessionRecord>,
            [Prisma.WorkoutSessionCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<unknown[]>,
            [Prisma.WorkoutSessionFindManyArgs]
         >(),
         findFirst: jest.fn<
            Promise<unknown>,
            [Prisma.WorkoutSessionFindFirstArgs]
         >(),
         findUnique: jest.fn<
            Promise<
               | WorkoutSessionRecord
               | { id: string }
               | { id: string; userId: string; endedAt: Date | null }
               | null
            >,
            [Prisma.WorkoutSessionFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<WorkoutSessionRecord>,
            [Prisma.WorkoutSessionUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<WorkoutSessionRecord>,
            [Prisma.WorkoutSessionDeleteArgs]
         >(),
         count: jest.fn<Promise<number>, [Prisma.WorkoutSessionCountArgs]>(),
      },
      workoutSet: {
         count: jest.fn<Promise<number>, [Prisma.WorkoutSetCountArgs]>(),
      },
   };
   const workoutProducerMock = {
      enqueueWorkoutCompleted: jest.fn(),
   };

   const createWorkoutSessionDto: CreateWorkoutSessionDto = {
      userId: 'user_123',
      workoutPlanId: 'workoutPlan_123',
      name: 'Pierna pesada',
      notes: 'Buenas sensaciones.',
      startedAt: '2026-03-23T10:00:00.000Z',
      endedAt: '2026-03-23T11:15:00.000Z',
   };

   const createWorkoutSessionWithoutPlanDto: CreateWorkoutSessionDto = {
      userId: 'user_123',
      name: 'Cardio libre',
      notes: null,
      startedAt: '2026-03-23T18:00:00.000Z',
      endedAt: null,
   };

   const updatedWorkoutSessionDto: UpdateWorkoutSessionDto = {
      name: 'Pierna pesada actualizada',
      notes: 'Subir 2.5 kg la proxima semana.',
      endedAt: '2026-03-23T11:30:00.000Z',
   };

   const workoutSessionRecord: WorkoutSessionRecord = {
      id: 'workoutSession_123',
      userId: 'user_123',
      workoutPlanId: 'workoutPlan_123',
      name: 'Pierna pesada',
      notes: 'Buenas sensaciones.',
      startedAt: new Date('2026-03-23T10:00:00.000Z'),
      endedAt: new Date('2026-03-23T11:15:00.000Z'),
      sets: [
         { reps: 8, weightKg: 100 },
         { reps: 10, weightKg: 80 },
         { reps: null, weightKg: 50 },
      ],
   };

   const publicWorkoutSessionRecord: WorkoutSession = {
      id: workoutSessionRecord.id,
      userId: workoutSessionRecord.userId,
      workoutPlanId: workoutSessionRecord.workoutPlanId,
      name: workoutSessionRecord.name,
      notes: workoutSessionRecord.notes,
      startedAt: workoutSessionRecord.startedAt.toISOString(),
      endedAt: workoutSessionRecord.endedAt!.toISOString(),
      completedSetsCount: 3,
      volumeKg: 1600,
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            WorkoutSessionsService,
            {
               provide: PrismaService,
               useValue: prismaMock,
            },
            {
               provide: WorkoutProducer,
               useValue: workoutProducerMock,
            },
         ],
      }).compile();

      service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
   });

   describe('create', () => {
      it('creates a workout session with plan and returns the public record', async () => {
         prismaMock.workoutSession.create.mockResolvedValue(
            workoutSessionRecord,
         );

         const result = await service.create(createWorkoutSessionDto);
         const [createArgs] = prismaMock.workoutSession.create.mock.calls[0];

         expect(createArgs.data).toEqual({
            user: {
               connect: {
                  id: createWorkoutSessionDto.userId,
               },
            },
            workoutPlan: {
               connect: {
                  id: createWorkoutSessionDto.workoutPlanId,
               },
            },
            name: createWorkoutSessionDto.name,
            notes: createWorkoutSessionDto.notes,
            startedAt: new Date(createWorkoutSessionDto.startedAt),
            endedAt: new Date(createWorkoutSessionDto.endedAt!),
         });
         expect(createArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
            name: true,
            notes: true,
            startedAt: true,
            endedAt: true,
            sets: {
               where: { isCompleted: true },
               select: {
                  reps: true,
                  weightKg: true,
               },
            },
         });
         expect(result).toEqual(publicWorkoutSessionRecord);
      });

      it('creates a workout session without plan', async () => {
         const workoutSessionWithoutPlanRecord: WorkoutSessionRecord = {
            id: 'workoutSession_456',
            userId: 'user_123',
            workoutPlanId: null,
            name: 'Cardio libre',
            notes: null,
            startedAt: new Date('2026-03-23T18:00:00.000Z'),
            endedAt: null,
            sets: [],
         };

         prismaMock.workoutSession.create.mockResolvedValue(
            workoutSessionWithoutPlanRecord,
         );

         const result = await service.create(
            createWorkoutSessionWithoutPlanDto,
         );
         const [createArgs] = prismaMock.workoutSession.create.mock.calls[0];

         expect(createArgs.data).toEqual({
            user: {
               connect: {
                  id: createWorkoutSessionWithoutPlanDto.userId,
               },
            },
            name: createWorkoutSessionWithoutPlanDto.name,
            notes: createWorkoutSessionWithoutPlanDto.notes,
            startedAt: new Date(createWorkoutSessionWithoutPlanDto.startedAt),
            endedAt: null,
         });
         expect(createArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
         });
         expect(result).toEqual({
            id: workoutSessionWithoutPlanRecord.id,
            userId: workoutSessionWithoutPlanRecord.userId,
            workoutPlanId: workoutSessionWithoutPlanRecord.workoutPlanId,
            name: workoutSessionWithoutPlanRecord.name,
            notes: workoutSessionWithoutPlanRecord.notes,
            startedAt: workoutSessionWithoutPlanRecord.startedAt.toISOString(),
            endedAt: null,
            completedSetsCount: 0,
            volumeKg: 0,
         });
      });

      it('translates unexpected database errors into InternalServerErrorException', async () => {
         prismaMock.workoutSession.create.mockRejectedValue(
            new Error('db unavailable'),
         );

         await expect(
            service.create(createWorkoutSessionDto),
         ).rejects.toBeInstanceOf(InternalServerErrorException);
      });
   });

   describe('findAll', () => {
      it('returns only the authenticated user workout sessions when role is USER', async () => {
         prismaMock.workoutSession.findMany.mockResolvedValue([
            workoutSessionRecord,
         ]);

         const result = await service.findAll(currentUser, undefined);
         const [findManyArgs] =
            prismaMock.workoutSession.findMany.mock.calls[0];

         expect(findManyArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
            name: true,
            notes: true,
            startedAt: true,
            endedAt: true,
            sets: {
               where: { isCompleted: true },
               select: {
                  reps: true,
                  weightKg: true,
               },
            },
         });
         expect(findManyArgs.orderBy).toEqual({
            createdAt: 'desc',
         });
         expect(findManyArgs.where).toEqual({ userId: currentUser.sub });
         expect(result).toEqual([publicWorkoutSessionRecord]);
      });

      it('allows privileged roles to filter by userId', async () => {
         prismaMock.workoutSession.findMany.mockResolvedValue([
            workoutSessionRecord,
         ]);

         await service.findAll(adminUser, 'target_user');
         const [findManyArgs] =
            prismaMock.workoutSession.findMany.mock.calls[0];

         expect(findManyArgs.where).toEqual({ userId: 'target_user' });
      });

      it('returns the workout session when it exists', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue(
            workoutSessionRecord,
         );

         const result = await service.findOne(
            currentUser,
            workoutSessionRecord.id,
         );
         const [findUniqueArgs] =
            prismaMock.workoutSession.findUnique.mock.calls[0];

         expect(findUniqueArgs.where).toEqual({
            id: workoutSessionRecord.id,
            userId: currentUser.sub,
         });
         expect(findUniqueArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
            name: true,
            notes: true,
            startedAt: true,
            endedAt: true,
            sets: {
               where: { isCompleted: true },
               select: {
                  reps: true,
                  weightKg: true,
               },
            },
         });
         expect(result).toEqual(publicWorkoutSessionRecord);
      });

      it('throws NotFoundException when the workout session does not exist', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue(null);

         await expect(
            service.findOne(currentUser, 'missing_workoutSession'),
         ).rejects.toBeInstanceOf(NotFoundException);
      });

      it('updates normal editable fields', async () => {
         const updatedRecord: WorkoutSessionRecord = {
            ...workoutSessionRecord,
            name: updatedWorkoutSessionDto.name!,
            notes: updatedWorkoutSessionDto.notes!,
            endedAt: new Date(updatedWorkoutSessionDto.endedAt!),
         };

         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.update.mockResolvedValue(updatedRecord);

         const result = await service.update(
            currentUser,
            workoutSessionRecord.id,
            updatedWorkoutSessionDto,
         );
         const [findUniqueArgs] =
            prismaMock.workoutSession.findUnique.mock.calls[0];
         const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: workoutSessionRecord.id, userId: currentUser.sub },
            select: { id: true, userId: true, endedAt: true },
         });
         expect(updateArgs.where).toEqual({ id: workoutSessionRecord.id });
         expect(updateArgs.data).toEqual({
            name: updatedWorkoutSessionDto.name,
            notes: updatedWorkoutSessionDto.notes,
            endedAt: new Date(updatedWorkoutSessionDto.endedAt!),
            workoutPlan: undefined,
         });
         expect(updateArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
         });
         expect(result).toEqual({
            id: updatedRecord.id,
            userId: updatedRecord.userId,
            workoutPlanId: updatedRecord.workoutPlanId,
            name: updatedRecord.name,
            notes: updatedRecord.notes,
            startedAt: updatedRecord.startedAt.toISOString(),
            endedAt: updatedRecord.endedAt!.toISOString(),
            completedSetsCount: 3,
            volumeKg: 1600,
         });
      });

      it('attaches a plan when workoutPlanId is provided', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.update.mockResolvedValue({
            ...workoutSessionRecord,
            workoutPlanId: 'workoutPlan_456',
         });

         await service.update(currentUser, workoutSessionRecord.id, {
            workoutPlanId: 'workoutPlan_456',
         });
         const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

         expect(updateArgs.where).toEqual({ id: workoutSessionRecord.id });
         expect(updateArgs.data).toEqual({
            name: undefined,
            notes: undefined,
            endedAt: undefined,
            workoutPlan: {
               connect: {
                  id: 'workoutPlan_456',
               },
            },
         });
         expect(updateArgs.select).toBeDefined();
      });

      it('detaches a plan when workoutPlanId is null', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.update.mockResolvedValue({
            ...workoutSessionRecord,
            workoutPlanId: null,
         });

         await service.update(currentUser, workoutSessionRecord.id, {
            workoutPlanId: null,
         });
         const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

         expect(updateArgs.where).toEqual({ id: workoutSessionRecord.id });
         expect(updateArgs.data).toEqual({
            name: undefined,
            notes: undefined,
            endedAt: undefined,
            workoutPlan: {
               disconnect: true,
            },
         });
         expect(updateArgs.select).toBeDefined();
      });

      it('keeps current plan unchanged when workoutPlanId is omitted', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.update.mockResolvedValue(
            workoutSessionRecord,
         );

         await service.update(currentUser, workoutSessionRecord.id, {
            notes: 'Mantener plan actual',
         });
         const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

         expect(updateArgs.where).toEqual({ id: workoutSessionRecord.id });
         expect(updateArgs.data).toEqual({
            name: undefined,
            notes: 'Mantener plan actual',
            endedAt: undefined,
            workoutPlan: undefined,
         });
         expect(updateArgs.select).toBeDefined();
      });

      it('throws NotFoundException when updating a missing workout session', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue(null);

         await expect(
            service.update(
               currentUser,
               'missing_workoutSession',
               updatedWorkoutSessionDto,
            ),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutSession.update).not.toHaveBeenCalled();
      });

      it('translates unexpected database errors into InternalServerErrorException', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.update.mockRejectedValue(
            new Error('db unavailable'),
         );

         await expect(
            service.update(
               currentUser,
               workoutSessionRecord.id,
               updatedWorkoutSessionDto,
            ),
         ).rejects.toBeInstanceOf(InternalServerErrorException);
      });

      it('verifies existence and returns the deleted workout session', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
         });
         prismaMock.workoutSession.delete.mockResolvedValue(
            workoutSessionRecord,
         );

         const result = await service.remove(
            currentUser,
            workoutSessionRecord.id,
         );
         const [findUniqueArgs] =
            prismaMock.workoutSession.findUnique.mock.calls[0];
         const [deleteArgs] = prismaMock.workoutSession.delete.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: workoutSessionRecord.id, userId: currentUser.sub },
            select: { id: true, userId: true, endedAt: true },
         });
         expect(deleteArgs.where).toEqual({ id: workoutSessionRecord.id });
         expect(deleteArgs.select).toMatchObject({
            id: true,
            userId: true,
            workoutPlanId: true,
            name: true,
            notes: true,
            startedAt: true,
            endedAt: true,
            sets: {
               where: { isCompleted: true },
               select: {
                  reps: true,
                  weightKg: true,
               },
            },
         });
         expect(result).toEqual(publicWorkoutSessionRecord);
      });

      it('throws NotFoundException when removing a missing workout session', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue(null);

         await expect(
            service.remove(currentUser, 'missing_workoutSession'),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.workoutSession.delete).not.toHaveBeenCalled();
      });

      it('marks the session as completed and enqueues the workout.completed job', async () => {
         const completedAt = new Date('2026-03-24T10:00:00.000Z');
         const realDate = global.Date;

         global.Date = class extends Date {
            constructor(value?: string | number | Date) {
               super(value ?? completedAt);
            }

            static now() {
               return completedAt.getTime();
            }
         } as DateConstructor;

         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
            userId: workoutSessionRecord.userId,
            endedAt: null,
         });
         prismaMock.workoutSession.update.mockResolvedValue({
            ...workoutSessionRecord,
            endedAt: completedAt,
         });
         prismaMock.workoutSet.count.mockResolvedValue(1);

         try {
            const result = await service.completeSession(
               currentUser,
               workoutSessionRecord.id,
            );
            const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];
            const [countArgs] = prismaMock.workoutSet.count.mock.calls[0];

            expect(countArgs.where).toEqual({
               workoutSessionId: workoutSessionRecord.id,
               isCompleted: true,
            });
            expect(updateArgs.where).toEqual({ id: workoutSessionRecord.id });
            expect(updateArgs.data).toEqual({
               endedAt: completedAt,
               notes: null,
            });
            expect(updateArgs.select).toMatchObject({
               id: true,
               userId: true,
               workoutPlanId: true,
               name: true,
               notes: true,
               startedAt: true,
               endedAt: true,
               sets: {
                  where: { isCompleted: true },
                  select: {
                     reps: true,
                     weightKg: true,
                  },
               },
            });
            expect(
               workoutProducerMock.enqueueWorkoutCompleted,
            ).toHaveBeenCalledWith(
               workoutSessionRecord.id,
               workoutSessionRecord.userId,
            );
            expect(result).toEqual({
               id: workoutSessionRecord.id,
               userId: workoutSessionRecord.userId,
               workoutPlanId: workoutSessionRecord.workoutPlanId,
               name: workoutSessionRecord.name,
               notes: workoutSessionRecord.notes,
               startedAt: workoutSessionRecord.startedAt.toISOString(),
               endedAt: completedAt.toISOString(),
               completedSetsCount: 3,
               volumeKg: 1600,
            });
            expect(result).not.toHaveProperty('sets');
         } finally {
            global.Date = realDate;
         }
      });

      it('stores a trimmed completion note', async () => {
         const completedAt = new Date('2026-03-24T10:00:00.000Z');
         const realDate = global.Date;

         global.Date = class extends Date {
            constructor(value?: string | number | Date) {
               super(value ?? completedAt);
            }
         } as DateConstructor;

         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
            userId: workoutSessionRecord.userId,
            endedAt: null,
         });
         prismaMock.workoutSession.update.mockResolvedValue({
            ...workoutSessionRecord,
            notes: 'Subir peso',
            endedAt: completedAt,
         });
         prismaMock.workoutSet.count.mockResolvedValue(1);

         try {
            await service.completeSession(
               currentUser,
               workoutSessionRecord.id,
               {
                  notes: '  Subir peso  ',
               },
            );
            const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

            expect(updateArgs.data).toEqual({
               endedAt: completedAt,
               notes: 'Subir peso',
            });
         } finally {
            global.Date = realDate;
         }
      });

      it('normalizes an empty completion note to null', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
            userId: workoutSessionRecord.userId,
            endedAt: null,
         });
         prismaMock.workoutSession.update.mockResolvedValue({
            ...workoutSessionRecord,
            notes: null,
            endedAt: new Date('2026-03-24T10:00:00.000Z'),
         });
         prismaMock.workoutSet.count.mockResolvedValue(1);

         await service.completeSession(currentUser, workoutSessionRecord.id, {
            notes: '   ',
         });
         const [updateArgs] = prismaMock.workoutSession.update.mock.calls[0];

         expect(updateArgs.data).toMatchObject({
            notes: null,
         });
      });

      it('throws ConflictException when the session is already completed', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
            userId: workoutSessionRecord.userId,
            endedAt: workoutSessionRecord.endedAt,
         });

         await expect(
            service.completeSession(currentUser, workoutSessionRecord.id),
         ).rejects.toBeInstanceOf(ConflictException);
         expect(prismaMock.workoutSession.update).not.toHaveBeenCalled();
         expect(
            workoutProducerMock.enqueueWorkoutCompleted,
         ).not.toHaveBeenCalled();
      });

      it('throws ConflictException when the session has no completed sets', async () => {
         prismaMock.workoutSession.findUnique.mockResolvedValue({
            id: workoutSessionRecord.id,
            userId: workoutSessionRecord.userId,
            endedAt: null,
         });
         prismaMock.workoutSet.count.mockResolvedValue(0);

         await expect(
            service.completeSession(currentUser, workoutSessionRecord.id),
         ).rejects.toBeInstanceOf(ConflictException);
         expect(prismaMock.workoutSet.count).toHaveBeenCalledWith({
            where: {
               workoutSessionId: workoutSessionRecord.id,
               isCompleted: true,
            },
         });
         expect(prismaMock.workoutSession.update).not.toHaveBeenCalled();
         expect(
            workoutProducerMock.enqueueWorkoutCompleted,
         ).not.toHaveBeenCalled();
      });
   });

   describe('findCompleted', () => {
      const completedFeedRecord = {
         id: 'workoutSession_completed_123',
         name: 'Upper body',
         startedAt: new Date('2026-03-24T09:00:00.000Z'),
         endedAt: new Date('2026-03-24T10:05:00.000Z'),
         sets: [
            {
               setNumber: 1,
               reps: 8,
               weightKg: 80,
               exercise: {
                  id: 'exercise_bench',
                  name: 'Bench press',
                  muscleGroup: 'CHEST',
                  imageUrl: 'https://example.com/bench.png',
               },
            },
            {
               setNumber: 1,
               reps: 10,
               weightKg: 60,
               exercise: {
                  id: 'exercise_row',
                  name: 'Row',
                  muscleGroup: 'BACK',
                  imageUrl: null,
               },
            },
         ],
      };

      it('returns completed sessions for the authenticated user', async () => {
         prismaMock.workoutSession.findMany.mockResolvedValue([
            completedFeedRecord,
         ]);
         prismaMock.workoutSession.count.mockResolvedValue(1);

         const result = await service.findCompleted(currentUser, 0, 10);
         const [findManyArgs] =
            prismaMock.workoutSession.findMany.mock.calls[0];
         const [countArgs] = prismaMock.workoutSession.count.mock.calls[0];

         expect(findManyArgs.where).toEqual({
            userId: currentUser.sub,
            endedAt: { not: null },
         });
         expect(findManyArgs.skip).toBe(0);
         expect(findManyArgs.take).toBe(10);
         expect(findManyArgs.orderBy).toEqual({ endedAt: 'desc' });
         expect(countArgs).toEqual({ where: findManyArgs.where });
         expect(result).toEqual({
            items: [
               {
                  id: completedFeedRecord.id,
                  name: completedFeedRecord.name,
                  startedAt: completedFeedRecord.startedAt.toISOString(),
                  endedAt: completedFeedRecord.endedAt.toISOString(),
                  durationSeconds: 3900,
                  volumeKg: 1240,
                  exercises: [
                     {
                        id: 'exercise_bench',
                        name: 'Bench press',
                        muscleGroup: 'CHEST',
                        sets: 1,
                        completedSets: [{ setNumber: 1, reps: 8 }],
                        imageUrl: 'https://example.com/bench.png',
                     },
                     {
                        id: 'exercise_row',
                        name: 'Row',
                        muscleGroup: 'BACK',
                        sets: 1,
                        completedSets: [{ setNumber: 1, reps: 10 }],
                        imageUrl: null,
                     },
                  ],
                  hiddenExercises: 0,
               },
            ],
            total: 1,
            page: 0,
            limit: 10,
         });
      });

      it('allows privileged roles to filter completed sessions by userId', async () => {
         prismaMock.workoutSession.findMany.mockResolvedValue([]);
         prismaMock.workoutSession.count.mockResolvedValue(0);

         await service.findCompleted(adminUser, 2, 25, 'target_user');
         const [findManyArgs] =
            prismaMock.workoutSession.findMany.mock.calls[0];
         const [countArgs] = prismaMock.workoutSession.count.mock.calls[0];

         expect(findManyArgs.where).toEqual({
            userId: 'target_user',
            endedAt: { not: null },
         });
         expect(findManyArgs.skip).toBe(50);
         expect(findManyArgs.take).toBe(25);
         expect(countArgs).toEqual({ where: findManyArgs.where });
      });

      it('does not constrain privileged roles when userId is omitted', async () => {
         prismaMock.workoutSession.findMany.mockResolvedValue([]);
         prismaMock.workoutSession.count.mockResolvedValue(0);

         await service.findCompleted(adminUser, 0, 10);
         const [findManyArgs] =
            prismaMock.workoutSession.findMany.mock.calls[0];

         expect(findManyArgs.where).toEqual({
            userId: undefined,
            endedAt: { not: null },
         });
      });
   });
});
