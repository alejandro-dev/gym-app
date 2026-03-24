import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { WorkoutSessionsService } from './workout-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
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

type UpdateWorkoutSessionDto = Partial<Omit<CreateWorkoutSessionDto, 'userId' | 'startedAt'>>;

type WorkoutSessionRecord = {
	id: string;
	userId: string;
	workoutPlanId: string | null;
	name: string;
	notes: string | null;
	startedAt: Date;
	endedAt: Date | null;
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
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
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
			],
		}).compile();

		service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
	});

	describe('create', () => {
		it('creates a workout session with plan and returns the public record', async () => {
			prismaMock.workoutSession.create.mockResolvedValue(workoutSessionRecord);

			const result = await (service as any).create(createWorkoutSessionDto);

			expect(prismaMock.workoutSession.create).toHaveBeenCalledWith({
				data: {
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
				},
				select: {
					id: true,
					userId: true,
					workoutPlanId: true,
					name: true,
					notes: true,
					startedAt: true,
					endedAt: true,
				},
			});
			expect(result).toEqual(workoutSessionRecord);
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
			};

			prismaMock.workoutSession.create.mockResolvedValue(
				workoutSessionWithoutPlanRecord,
			);

			const result = await (service as any).create(
				createWorkoutSessionWithoutPlanDto,
			);

			expect(prismaMock.workoutSession.create).toHaveBeenCalledWith({
				data: {
					user: {
						connect: {
							id: createWorkoutSessionWithoutPlanDto.userId,
						},
					},
					name: createWorkoutSessionWithoutPlanDto.name,
					notes: createWorkoutSessionWithoutPlanDto.notes,
					startedAt: new Date(createWorkoutSessionWithoutPlanDto.startedAt),
					endedAt: null,
				},
				select: expect.objectContaining({
					id: true,
					userId: true,
					workoutPlanId: true,
				}),
			});
			expect(result).toEqual(workoutSessionWithoutPlanRecord);
		});

		it('translates unexpected database errors into InternalServerErrorException', async () => {
			prismaMock.workoutSession.create.mockRejectedValue(
				new Error('db unavailable'),
			);

			await expect(
				(service as any).create(createWorkoutSessionDto),
			).rejects.toBeInstanceOf(InternalServerErrorException);
		});
	});

	describe('findAll', () => {
		it('returns only the authenticated user workout sessions when role is USER', async () => {
			prismaMock.workoutSession.findMany.mockResolvedValue([workoutSessionRecord]);

			const result = await (service as any).findAll(currentUser, undefined);

			expect(prismaMock.workoutSession.findMany).toHaveBeenCalledWith({
				select: expect.objectContaining({
					id: true,
					userId: true,
					workoutPlanId: true,
					name: true,
					notes: true,
					startedAt: true,
					endedAt: true,
				}),
				orderBy: {
					createdAt: 'desc',
				},
				where: { userId: currentUser.sub },
			});
			expect(result).toEqual([workoutSessionRecord]);
		});

		it('allows privileged roles to filter by userId', async () => {
			prismaMock.workoutSession.findMany.mockResolvedValue([workoutSessionRecord]);

			await (service as any).findAll(adminUser, 'target_user');

			expect(prismaMock.workoutSession.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: 'target_user' },
				}),
			);
		});
	});

	describe('findOne', () => {
		it('returns the workout session when it exists', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue(workoutSessionRecord);

			const result = await (service as any).findOne(currentUser, workoutSessionRecord.id);

			expect(prismaMock.workoutSession.findUnique).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id, userId: currentUser.sub },
				select: expect.objectContaining({
					id: true,
					userId: true,
					workoutPlanId: true,
					name: true,
					notes: true,
					startedAt: true,
					endedAt: true,
				}),
			});
			expect(result).toEqual(workoutSessionRecord);
		});

		it('throws NotFoundException when the workout session does not exist', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).findOne(currentUser, 'missing_workoutSession'),
			).rejects.toBeInstanceOf(NotFoundException);
		});
	});

	describe('update', () => {
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

			const result = await (service as any).update(
				currentUser,
				workoutSessionRecord.id,
				updatedWorkoutSessionDto,
			);

			expect(prismaMock.workoutSession.findUnique).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id, userId: currentUser.sub },
				select: { id: true, userId: true },
			});
			expect(prismaMock.workoutSession.update).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id },
				data: {
					name: updatedWorkoutSessionDto.name,
					notes: updatedWorkoutSessionDto.notes,
					endedAt: new Date(updatedWorkoutSessionDto.endedAt!),
					workoutPlan: undefined,
				},
				select: expect.objectContaining({
					id: true,
					userId: true,
					workoutPlanId: true,
				}),
			});
			expect(result).toEqual(updatedRecord);
		});

		it('attaches a plan when workoutPlanId is provided', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue({
				id: workoutSessionRecord.id,
			});
			prismaMock.workoutSession.update.mockResolvedValue({
				...workoutSessionRecord,
				workoutPlanId: 'workoutPlan_456',
			});

			await (service as any).update(currentUser, workoutSessionRecord.id, {
				workoutPlanId: 'workoutPlan_456',
			});

			expect(prismaMock.workoutSession.update).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id },
				data: {
					name: undefined,
					notes: undefined,
					endedAt: undefined,
					workoutPlan: {
						connect: {
							id: 'workoutPlan_456',
						},
					},
				},
				select: expect.any(Object),
			});
		});

		it('detaches a plan when workoutPlanId is null', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue({
				id: workoutSessionRecord.id,
			});
			prismaMock.workoutSession.update.mockResolvedValue({
				...workoutSessionRecord,
				workoutPlanId: null,
			});

			await (service as any).update(currentUser, workoutSessionRecord.id, {
				workoutPlanId: null,
			});

			expect(prismaMock.workoutSession.update).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id },
				data: {
					name: undefined,
					notes: undefined,
					endedAt: undefined,
					workoutPlan: {
						disconnect: true,
					},
				},
				select: expect.any(Object),
			});
		});

		it('keeps current plan unchanged when workoutPlanId is omitted', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue({
				id: workoutSessionRecord.id,
			});
			prismaMock.workoutSession.update.mockResolvedValue(workoutSessionRecord);

			await (service as any).update(currentUser, workoutSessionRecord.id, {
				notes: 'Mantener plan actual',
			});

			expect(prismaMock.workoutSession.update).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id },
				data: {
					name: undefined,
					notes: 'Mantener plan actual',
					endedAt: undefined,
					workoutPlan: undefined,
				},
				select: expect.any(Object),
			});
		});

		it('throws NotFoundException when updating a missing workout session', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).update(currentUser, 'missing_workoutSession', updatedWorkoutSessionDto),
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
				(service as any).update(currentUser, workoutSessionRecord.id, updatedWorkoutSessionDto),
			).rejects.toBeInstanceOf(InternalServerErrorException);
		});
	});

	describe('remove', () => {
		it('verifies existence and returns the deleted workout session', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue({
				id: workoutSessionRecord.id,
			});
			prismaMock.workoutSession.delete.mockResolvedValue(workoutSessionRecord);

			const result = await (service as any).remove(currentUser, workoutSessionRecord.id);

			expect(prismaMock.workoutSession.findUnique).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id, userId: currentUser.sub },
				select: { id: true, userId: true },
			});
			expect(prismaMock.workoutSession.delete).toHaveBeenCalledWith({
				where: { id: workoutSessionRecord.id },
				select: expect.objectContaining({
					id: true,
					userId: true,
					workoutPlanId: true,
					name: true,
					notes: true,
					startedAt: true,
					endedAt: true,
				}),
			});
			expect(result).toEqual(workoutSessionRecord);
		});

		it('throws NotFoundException when removing a missing workout session', async () => {
			prismaMock.workoutSession.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).remove(currentUser, 'missing_workoutSession'),
			).rejects.toBeInstanceOf(NotFoundException);
			expect(prismaMock.workoutSession.delete).not.toHaveBeenCalled();
		});
	});
});
