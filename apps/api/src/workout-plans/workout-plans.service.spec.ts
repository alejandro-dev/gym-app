import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansService } from './workout-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import {
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';

type CreateWorkoutPlanDto = {
	userId: string;
	name: string;
	description: string | null;
	isActive: boolean;
};

type UpdateWorkoutPlanDto = Partial<CreateWorkoutPlanDto>;

type WorkoutPlanRecord = {
	id: string;
	userId: string;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

describe('WorkoutPlansService', () => {
	let service: WorkoutPlansService;

	const prismaMock = {
		workoutPlan: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
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

			const result = await (service as any).create(createWorkoutPlanDto);

			expect(prismaMock.workoutPlan.create).toHaveBeenCalledWith({
				data: {
					name: createWorkoutPlanDto.name,
					description: createWorkoutPlanDto.description,
					isActive: createWorkoutPlanDto.isActive,
					user: {
						connect: {
							id: createWorkoutPlanDto.userId,
						},
					},
				},
				select: {
					id: true,
					userId: true,
					name: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			expect(result).toEqual(workoutPlanRecord);
		});

		it('translates unexpected database errors into InternalServerErrorException', async () => {
			prismaMock.workoutPlan.create.mockRejectedValue(new Error('db unavailable'));

			await expect(
				(service as any).create(createWorkoutPlanDto),
			).rejects.toBeInstanceOf(InternalServerErrorException);
		});
	});

	describe('findAll', () => {
		it('returns the workout plan list in stable read order', async () => {
			const orderedWorkoutPlans = [
				updatedWorkoutPlanRecord,
				workoutPlanRecord,
			];

			prismaMock.workoutPlan.findMany.mockResolvedValue(orderedWorkoutPlans);

			const result = await (service as any).findAll();

			expect(prismaMock.workoutPlan.findMany).toHaveBeenCalledWith({
				select: expect.objectContaining({
					id: true,
					userId: true,
					name: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				}),
				orderBy: {
					createdAt: 'desc',
				},
			});
			expect(result).toEqual(orderedWorkoutPlans);
		});
	});

	describe('findOne', () => {
		it('returns the workout plan when it exists', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue(workoutPlanRecord);

			const result = await (service as any).findOne(workoutPlanRecord.id);

			expect(prismaMock.workoutPlan.findUnique).toHaveBeenCalledWith({
				where: { id: workoutPlanRecord.id },
				select: expect.objectContaining({
					id: true,
					userId: true,
					name: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(workoutPlanRecord);
		});

		it('throws NotFoundException when the workout plan does not exist', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).findOne('missing_workoutPlan'),
			).rejects.toBeInstanceOf(NotFoundException);
		});
	});

	describe('update', () => {
		it('verifies existence, updates the workout plan, and returns the updated record', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue({ id: workoutPlanRecord.id });
			prismaMock.workoutPlan.update.mockResolvedValue(updatedWorkoutPlanRecord);

			const result = await (service as any).update(
				workoutPlanRecord.id,
				updatedWorkoutPlanDto,
			);

			expect(prismaMock.workoutPlan.findUnique).toHaveBeenCalledWith({
				where: { id: workoutPlanRecord.id },
				select: { id: true },
			});
			expect(prismaMock.workoutPlan.update).toHaveBeenCalledWith({
				where: { id: workoutPlanRecord.id },
				data: {
					name: updatedWorkoutPlanDto.name,
					description: updatedWorkoutPlanDto.description,
					isActive: undefined,
				},
				select: expect.objectContaining({
					id: true,
					userId: true,
					name: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(updatedWorkoutPlanRecord);
		});

		it('throws NotFoundException when updating a missing workout plan', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).update('missing_workoutPlan', updatedWorkoutPlanDto),
			).rejects.toBeInstanceOf(NotFoundException);
			expect(prismaMock.workoutPlan.update).not.toHaveBeenCalled();
		});

		it('translates unexpected database errors into InternalServerErrorException', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue({ id: workoutPlanRecord.id });
			prismaMock.workoutPlan.update.mockRejectedValue(new Error('db unavailable'));

			await expect(
				(service as any).update(workoutPlanRecord.id, updatedWorkoutPlanDto),
			).rejects.toBeInstanceOf(InternalServerErrorException);
		});
	});

	describe('remove', () => {
		it('verifies existence and returns the deleted workout plan', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue({ id: workoutPlanRecord.id });
			prismaMock.workoutPlan.delete.mockResolvedValue(workoutPlanRecord);

			const result = await (service as any).remove(workoutPlanRecord.id);

			expect(prismaMock.workoutPlan.findUnique).toHaveBeenCalledWith({
				where: { id: workoutPlanRecord.id },
				select: { id: true },
			});
			expect(prismaMock.workoutPlan.delete).toHaveBeenCalledWith({
				where: { id: workoutPlanRecord.id },
				select: expect.objectContaining({
					id: true,
					userId: true,
					name: true,
					description: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(workoutPlanRecord);
		});

		it('throws NotFoundException when removing a missing workout plan', async () => {
			prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).remove('missing_workoutPlan'),
			).rejects.toBeInstanceOf(NotFoundException);
			expect(prismaMock.workoutPlan.delete).not.toHaveBeenCalled();
		});
	});
});
