import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordsController } from './personal-records.controller';
import { PersonalRecordsService } from './personal-records.service';

describe('PersonalRecordsController', () => {
	let controller: PersonalRecordsController;

	const personalRecordsServiceMock = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	const personalRecordRecord = {
		id: 'personalRecord_456',
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
			controllers: [PersonalRecordsController],
			providers: [
				{
					provide: PersonalRecordsService,
					useValue: personalRecordsServiceMock,
				},
			],
		}).compile();

		controller = module.get<PersonalRecordsController>(PersonalRecordsController);
	});

	it('delegates create to the service', async () => {
		const dto = {
			userId: 'user_123',
			exerciseId: 'exercise_123',
			metric: 'estimated-1rm',
			value: 120,
			achievedAt: '2026-03-23T10:00:00.000Z',
		};
		personalRecordsServiceMock.create.mockResolvedValue(personalRecordRecord);
		const result = await (controller as any).create(dto);
		expect(personalRecordsServiceMock.create).toHaveBeenCalledWith(dto);
		expect(result).toEqual(personalRecordRecord);
	});

	it('delegates findAll to the service', async () => {
		personalRecordsServiceMock.findAll.mockResolvedValue([personalRecordRecord]);
		const result = await (controller as any).findAll();
		expect(personalRecordsServiceMock.findAll).toHaveBeenCalledTimes(1);
		expect(result).toEqual([personalRecordRecord]);
	});

	it('delegates findOne to the service', async () => {
		personalRecordsServiceMock.findOne.mockResolvedValue(personalRecordRecord);
		const result = await (controller as any).findOne(personalRecordRecord.id);
		expect(personalRecordsServiceMock.findOne).toHaveBeenCalledWith(personalRecordRecord.id);
		expect(result).toEqual(personalRecordRecord);
	});

	it('delegates update to the service', async () => {
		personalRecordsServiceMock.update.mockResolvedValue({
			...personalRecordRecord,
			value: 125,
		});
		const result = await (controller as any).update(personalRecordRecord.id, { value: 125 });
		expect(personalRecordsServiceMock.update).toHaveBeenCalledWith(personalRecordRecord.id, { value: 125 });
		expect(result).toEqual({ ...personalRecordRecord, value: 125 });
	});

	it('delegates remove to the service', async () => {
		personalRecordsServiceMock.remove.mockResolvedValue(personalRecordRecord);
		const result = await (controller as any).remove(personalRecordRecord.id);
		expect(personalRecordsServiceMock.remove).toHaveBeenCalledWith(personalRecordRecord.id);
		expect(result).toEqual(personalRecordRecord);
	});
});
