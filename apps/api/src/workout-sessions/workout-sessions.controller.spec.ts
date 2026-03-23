import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSessionsService } from './workout-sessions.service';

type CreateWorkoutSessionDto = {
	userId: string;
	workoutPlanId?: string | null;
	name: string;
	notes?: string | null;
	startedAt: string;
	endedAt?: string | null;
};

type UpdateWorkoutSessionDto = Partial<Omit<CreateWorkoutSessionDto, 'userId' | 'startedAt'>>;

describe('WorkoutSessionsController', () => {
	let controller: WorkoutSessionsController;

	const workoutSessionsServiceMock = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
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

	const workoutSessionRecord = {
		id: 'workoutSession_456',
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
			controllers: [WorkoutSessionsController],
			providers: [
				{
					provide: WorkoutSessionsService,
					useValue: workoutSessionsServiceMock,
				},
			],
		}).compile();

		controller = module.get<WorkoutSessionsController>(WorkoutSessionsController);
	});

	describe('create', () => {
		it('delegates to workoutSessionsService.create with plan', async () => {
			workoutSessionsServiceMock.create.mockResolvedValue(workoutSessionRecord);

			const result = await (controller as any).create(createWorkoutSessionDto);

			expect(workoutSessionsServiceMock.create).toHaveBeenCalledWith(
				createWorkoutSessionDto,
			);
			expect(result).toEqual(workoutSessionRecord);
		});

		it('delegates to workoutSessionsService.create without plan', async () => {
			workoutSessionsServiceMock.create.mockResolvedValue({
				...workoutSessionRecord,
				workoutPlanId: null,
				...createWorkoutSessionWithoutPlanDto,
				startedAt: new Date(createWorkoutSessionWithoutPlanDto.startedAt),
				endedAt: null,
			});

			await (controller as any).create(createWorkoutSessionWithoutPlanDto);

			expect(workoutSessionsServiceMock.create).toHaveBeenCalledWith(
				createWorkoutSessionWithoutPlanDto,
			);
		});
	});

	describe('findAll', () => {
		it('delegates to workoutSessionsService.findAll', async () => {
			workoutSessionsServiceMock.findAll.mockResolvedValue([workoutSessionRecord]);

			const result = await (controller as any).findAll();

			expect(workoutSessionsServiceMock.findAll).toHaveBeenCalledTimes(1);
			expect(result).toEqual([workoutSessionRecord]);
		});
	});

	describe('findOne', () => {
		it('delegates to workoutSessionsService.findOne', async () => {
			workoutSessionsServiceMock.findOne.mockResolvedValue(workoutSessionRecord);

			const result = await (controller as any).findOne(workoutSessionRecord.id);

			expect(workoutSessionsServiceMock.findOne).toHaveBeenCalledWith(
				workoutSessionRecord.id,
			);
			expect(result).toEqual(workoutSessionRecord);
		});
	});

	describe('update', () => {
		it('delegates to workoutSessionsService.update', async () => {
			const updateWorkoutSessionDto: UpdateWorkoutSessionDto = {
				workoutPlanId: null,
				notes: 'Sin plan asociado',
			};

			workoutSessionsServiceMock.update.mockResolvedValue({
				...workoutSessionRecord,
				workoutPlanId: null,
				notes: 'Sin plan asociado',
			});

			const result = await (controller as any).update(
				workoutSessionRecord.id,
				updateWorkoutSessionDto,
			);

			expect(workoutSessionsServiceMock.update).toHaveBeenCalledWith(
				workoutSessionRecord.id,
				updateWorkoutSessionDto,
			);
			expect(result).toEqual({
				...workoutSessionRecord,
				workoutPlanId: null,
				notes: 'Sin plan asociado',
			});
		});
	});

	describe('remove', () => {
		it('delegates to workoutSessionsService.remove', async () => {
			workoutSessionsServiceMock.remove.mockResolvedValue(workoutSessionRecord);

			const result = await (controller as any).remove(workoutSessionRecord.id);

			expect(workoutSessionsServiceMock.remove).toHaveBeenCalledWith(
				workoutSessionRecord.id,
			);
			expect(result).toEqual(workoutSessionRecord);
		});
	});
});
