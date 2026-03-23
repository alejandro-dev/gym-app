import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordsService } from './personal-records.service';
import { PrismaService } from '../prisma/prisma.service';
import {
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';

describe('PersonalRecordsService', () => {
	let service: PersonalRecordsService;

	const prismaMock = {
		personalRecord: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	};

	const createPersonalRecordDto = {
		userId: 'user_123',
		exerciseId: 'exercise_123',
		metric: 'estimated-1rm',
		value: 120,
		achievedAt: '2026-03-23T10:00:00.000Z',
	};

	const personalRecordRecord = {
		id: 'personalRecord_123',
		userId: 'user_123',
		exerciseId: 'exercise_123',
		metric: 'estimated-1rm',
		value: 120,
		achievedAt: new Date('2026-03-23T10:00:00.000Z'),
		createdAt: new Date('2026-03-23T10:05:00.000Z'),
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PersonalRecordsService,
				{
					provide: PrismaService,
					useValue: prismaMock,
				},
			],
		}).compile();

		service = module.get<PersonalRecordsService>(PersonalRecordsService);
	});

	it('creates a personal record and returns the public record', async () => {
		prismaMock.personalRecord.create.mockResolvedValue(personalRecordRecord);

		const result = await (service as any).create(createPersonalRecordDto);

		expect(prismaMock.personalRecord.create).toHaveBeenCalledWith({
			data: {
				user: {
					connect: {
						id: createPersonalRecordDto.userId,
					},
				},
				exercise: {
					connect: {
						id: createPersonalRecordDto.exerciseId,
					},
				},
				metric: createPersonalRecordDto.metric,
				value: createPersonalRecordDto.value,
				achievedAt: new Date(createPersonalRecordDto.achievedAt),
			},
			select: expect.objectContaining({
				id: true,
				userId: true,
				exerciseId: true,
				metric: true,
				value: true,
				achievedAt: true,
				createdAt: true,
			}),
		});
		expect(result).toEqual(personalRecordRecord);
	});

	it('translates unexpected database errors into InternalServerErrorException', async () => {
		prismaMock.personalRecord.create.mockRejectedValue(new Error('db unavailable'));

		await expect(
			(service as any).create(createPersonalRecordDto),
		).rejects.toBeInstanceOf(InternalServerErrorException);
	});

	it('returns the personal record list in stable read order', async () => {
		prismaMock.personalRecord.findMany.mockResolvedValue([personalRecordRecord]);

		const result = await (service as any).findAll();

		expect(prismaMock.personalRecord.findMany).toHaveBeenCalledWith({
			select: expect.objectContaining({
				id: true,
				userId: true,
				exerciseId: true,
				metric: true,
				value: true,
				achievedAt: true,
				createdAt: true,
			}),
			orderBy: [{ achievedAt: 'desc' }, { createdAt: 'desc' }],
		});
		expect(result).toEqual([personalRecordRecord]);
	});

	it('returns the personal record when it exists', async () => {
		prismaMock.personalRecord.findUnique.mockResolvedValue(personalRecordRecord);

		const result = await (service as any).findOne(personalRecordRecord.id);

		expect(result).toEqual(personalRecordRecord);
	});

	it('throws NotFoundException when the personal record does not exist', async () => {
		prismaMock.personalRecord.findUnique.mockResolvedValue(null);

		await expect(
			(service as any).findOne('missing_personalRecord'),
		).rejects.toBeInstanceOf(NotFoundException);
	});

	it('updates the personal record and returns the updated record', async () => {
		prismaMock.personalRecord.findUnique.mockResolvedValue({ id: personalRecordRecord.id });
		prismaMock.personalRecord.update.mockResolvedValue({
			...personalRecordRecord,
			value: 125,
		});

		const result = await (service as any).update(personalRecordRecord.id, {
			value: 125,
		});

		expect(prismaMock.personalRecord.update).toHaveBeenCalledWith({
			where: { id: personalRecordRecord.id },
			data: {
				metric: undefined,
				value: 125,
				achievedAt: undefined,
			},
			select: expect.any(Object),
		});
		expect(result).toEqual({
			...personalRecordRecord,
			value: 125,
		});
	});

	it('throws NotFoundException when removing a missing personal record', async () => {
		prismaMock.personalRecord.findUnique.mockResolvedValue(null);

		await expect(
			(service as any).remove('missing_personalRecord'),
		).rejects.toBeInstanceOf(NotFoundException);
	});
});
