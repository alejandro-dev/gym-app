import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';

type CreateWorkoutPlanDto = {
	userId: string;
	name: string;
	description: string | null;
	isActive: boolean;
};

type UpdateWorkoutPlanDto = Partial<CreateWorkoutPlanDto>;

describe('WorkoutPlansController', () => {
	let controller: WorkoutPlansController;

	const workoutPlansServiceMock = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
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

	const workoutPlanRecord = {
		id: 'workoutPlan_456',
		...createWorkoutPlanDto,
		createdAt: new Date('2026-03-21T10:00:00.000Z'),
		updatedAt: new Date('2026-03-21T10:00:00.000Z'),
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [WorkoutPlansController],
			providers: [
				{
					provide: WorkoutPlansService,
					useValue: workoutPlansServiceMock,
				},
			],
		}).compile();

		controller = module.get<WorkoutPlansController>(WorkoutPlansController);
	});

	describe('create', () => {
		it('delegates to workoutPlansService.create', async () => {
			workoutPlansServiceMock.create.mockResolvedValue(workoutPlanRecord);

			const result = await (controller as any).create(createWorkoutPlanDto);

			expect(workoutPlansServiceMock.create).toHaveBeenCalledWith(createWorkoutPlanDto);
			expect(result).toEqual(workoutPlanRecord);
		});
	});

	describe('findAll', () => {
		it('delegates to workoutPlansService.findAll', async () => {
			workoutPlansServiceMock.findAll.mockResolvedValue([workoutPlanRecord]);

			const result = await (controller as any).findAll();

			expect(workoutPlansServiceMock.findAll).toHaveBeenCalledTimes(1);
			expect(result).toEqual([workoutPlanRecord]);
		});
	});

	describe('findOne', () => {
		it('delegates to workoutPlansService.findOne', async () => {
			workoutPlansServiceMock.findOne.mockResolvedValue(workoutPlanRecord);

			const result = await (controller as any).findOne(workoutPlanRecord.id);

			expect(workoutPlansServiceMock.findOne).toHaveBeenCalledWith(
				workoutPlanRecord.id,
			);
			expect(result).toEqual(workoutPlanRecord);
		});
	});

	describe('update', () => {
		it('delegates to workoutPlansService.update', async () => {
			workoutPlansServiceMock.update.mockResolvedValue({
				...workoutPlanRecord,
				...updatedWorkoutPlanDto,
			});

			const result = await (controller as any).update(
				workoutPlanRecord.id,
				updatedWorkoutPlanDto,
			);

			expect(workoutPlansServiceMock.update).toHaveBeenCalledWith(
				workoutPlanRecord.id,
				updatedWorkoutPlanDto,
			);
			expect(result).toEqual({
				...workoutPlanRecord,
				...updatedWorkoutPlanDto,
			});
		});
	});

	describe('remove', () => {
		it('delegates to workoutPlansService.remove', async () => {
			workoutPlansServiceMock.remove.mockResolvedValue(workoutPlanRecord);

			const result = await (controller as any).remove(workoutPlanRecord.id);

			expect(workoutPlansServiceMock.remove).toHaveBeenCalledWith(
				workoutPlanRecord.id,
			);
			expect(result).toEqual(workoutPlanRecord);
		});
	});
});
