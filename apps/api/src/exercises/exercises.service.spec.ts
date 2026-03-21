import {
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MuscleGroup, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExercisesService } from './exercises.service';

type CreateExerciseDto = {
	name: string;
	slug: string;
	description: string | null;
	instructions: string | null;
	muscleGroup: MuscleGroup;
	equipment: string | null;
	isCompound: boolean;
};

type UpdateExerciseDto = Partial<CreateExerciseDto>;

type ExerciseRecord = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	instructions: string | null;
	muscleGroup: MuscleGroup;
	equipment: string | null;
	isCompound: boolean;
	createdAt: Date;
	updatedAt: Date;
};

describe('ExercisesService', () => {
	let service: ExercisesService;

	const prismaMock = {
		exercise: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	};

	const createExerciseDto: CreateExerciseDto = {
		name: 'Barbell Back Squat',
		slug: 'barbell-back-squat',
		description: 'Classic lower-body strength exercise.',
		instructions: 'Brace, descend below parallel, and drive up.',
		muscleGroup: MuscleGroup.LEGS,
		equipment: 'Barbell',
		isCompound: true,
	};

	const updatedExerciseDto: UpdateExerciseDto = {
		description: 'Updated description',
		equipment: 'Safety squat bar',
	};

	const exerciseRecord: ExerciseRecord = {
		id: 'exercise_123',
		...createExerciseDto,
		createdAt: new Date('2026-03-21T10:00:00.000Z'),
		updatedAt: new Date('2026-03-21T10:00:00.000Z'),
	};

	const updatedExerciseRecord: ExerciseRecord = {
		...exerciseRecord,
		...updatedExerciseDto,
		updatedAt: new Date('2026-03-21T11:00:00.000Z'),
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ExercisesService,
				{
					provide: PrismaService,
					useValue: prismaMock,
				},
			],
		}).compile();

		service = module.get<ExercisesService>(ExercisesService);
	});

	describe('create', () => {
		it('creates an exercise and returns the public record', async () => {
			prismaMock.exercise.create.mockResolvedValue(exerciseRecord);

			const result = await (service as any).create(createExerciseDto);

			expect(prismaMock.exercise.create).toHaveBeenCalledWith({
				data: createExerciseDto,
				select: expect.objectContaining({
					id: true,
					name: true,
					slug: true,
					description: true,
					instructions: true,
					muscleGroup: true,
					equipment: true,
					isCompound: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(exerciseRecord);
		});

		it('translates unique constraint errors into ConflictException', async () => {
			prismaMock.exercise.create.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError(
					'Unique constraint failed',
					{
						code: 'P2002',
						clientVersion: '6.19.2',
						meta: {
							target: ['name'],
						},
					},
				),
			);

			await expect(
				(service as any).create(createExerciseDto),
			).rejects.toBeInstanceOf(ConflictException);
		});
	});

	describe('findAll', () => {
		it('returns the exercise list in stable read order', async () => {
			const orderedExercises = [
				updatedExerciseRecord,
				exerciseRecord,
			];

			prismaMock.exercise.findMany.mockResolvedValue(orderedExercises);

			const result = await (service as any).findAll();

			expect(prismaMock.exercise.findMany).toHaveBeenCalledWith({
				select: expect.objectContaining({
					id: true,
					name: true,
					slug: true,
					description: true,
					instructions: true,
					muscleGroup: true,
					equipment: true,
					isCompound: true,
					createdAt: true,
					updatedAt: true,
				}),
				orderBy: {
					createdAt: 'desc',
				},
			});
			expect(result).toEqual(orderedExercises);
		});
	});

	describe('findOne', () => {
		it('returns the exercise when it exists', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue(exerciseRecord);

			const result = await (service as any).findOne(exerciseRecord.id);

			expect(prismaMock.exercise.findUnique).toHaveBeenCalledWith({
				where: { id: exerciseRecord.id },
				select: expect.objectContaining({
					id: true,
					name: true,
					slug: true,
					description: true,
					instructions: true,
					muscleGroup: true,
					equipment: true,
					isCompound: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(exerciseRecord);
		});

		it('throws NotFoundException when the exercise does not exist', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).findOne('missing_exercise'),
			).rejects.toBeInstanceOf(NotFoundException);
		});
	});

	describe('update', () => {
		it('verifies existence, updates the exercise, and returns the updated record', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue({ id: exerciseRecord.id });
			prismaMock.exercise.update.mockResolvedValue(updatedExerciseRecord);

			const result = await (service as any).update(
				exerciseRecord.id,
				updatedExerciseDto,
			);

			expect(prismaMock.exercise.findUnique).toHaveBeenCalledWith({
				where: { id: exerciseRecord.id },
				select: { id: true },
			});
			expect(prismaMock.exercise.update).toHaveBeenCalledWith({
				where: { id: exerciseRecord.id },
				data: {
					name: undefined,
					slug: undefined,
					description: updatedExerciseDto.description,
					instructions: undefined,
					muscleGroup: undefined,
					equipment: updatedExerciseDto.equipment,
					isCompound: undefined,
				},
				select: expect.objectContaining({
					id: true,
					name: true,
					slug: true,
					description: true,
					instructions: true,
					muscleGroup: true,
					equipment: true,
					isCompound: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(updatedExerciseRecord);
		});

		it('throws NotFoundException when updating a missing exercise', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).update('missing_exercise', updatedExerciseDto),
			).rejects.toBeInstanceOf(NotFoundException);
			expect(prismaMock.exercise.update).not.toHaveBeenCalled();
		});

		it('translates unique constraint errors into ConflictException', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue({ id: exerciseRecord.id });
			prismaMock.exercise.update.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError(
					'Unique constraint failed',
					{
						code: 'P2002',
						clientVersion: '6.19.2',
						meta: {
							target: ['slug'],
						},
					},
				),
			);

			await expect(
				(service as any).update(exerciseRecord.id, updatedExerciseDto),
			).rejects.toBeInstanceOf(ConflictException);
		});
	});

	describe('remove', () => {
		it('verifies existence and returns the deleted exercise', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue({ id: exerciseRecord.id });
			prismaMock.exercise.delete.mockResolvedValue(exerciseRecord);

			const result = await (service as any).remove(exerciseRecord.id);

			expect(prismaMock.exercise.findUnique).toHaveBeenCalledWith({
				where: { id: exerciseRecord.id },
				select: { id: true },
			});
			expect(prismaMock.exercise.delete).toHaveBeenCalledWith({
				where: { id: exerciseRecord.id },
				select: expect.objectContaining({
					id: true,
					name: true,
					slug: true,
					description: true,
					instructions: true,
					muscleGroup: true,
					equipment: true,
					isCompound: true,
					createdAt: true,
					updatedAt: true,
				}),
			});
			expect(result).toEqual(exerciseRecord);
		});

		it('throws NotFoundException when removing a missing exercise', async () => {
			prismaMock.exercise.findUnique.mockResolvedValue(null);

			await expect(
				(service as any).remove('missing_exercise'),
			).rejects.toBeInstanceOf(NotFoundException);
			expect(prismaMock.exercise.delete).not.toHaveBeenCalled();
		});
	});
});
