import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseCategory, MuscleGroup } from '@prisma/client';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

type CreateExerciseDto = {
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  equipment: string | null;
  isCompound: boolean;
};

type UpdateExerciseDto = Partial<CreateExerciseDto>;

describe('ExercisesController', () => {
  let controller: ExercisesController;

  const exercisesServiceMock: {
    create: jest.Mock<Promise<typeof exerciseRecord>, [CreateExerciseDto]>;
    findAll: jest.Mock<Promise<typeof exerciseRecord[]>, []>;
    findOne: jest.Mock<Promise<typeof exerciseRecord>, [string]>;
    update: jest.Mock<
      Promise<typeof exerciseRecord>,
      [string, UpdateExerciseDto]
    >;
    remove: jest.Mock<Promise<typeof exerciseRecord>, [string]>;
  } = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const createExerciseDto: CreateExerciseDto = {
    name: 'Barbell Bench Press',
    slug: 'barbell-bench-press',
    description: 'Horizontal pressing movement.',
    instructions: 'Lower under control and press to lockout.',
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: 'Barbell',
    isCompound: true,
  };

  const updateExerciseDto: UpdateExerciseDto = {
    description: 'Updated pressing movement description.',
  };

  const exerciseRecord = {
    id: 'exercise_456',
    ...createExerciseDto,
    createdAt: new Date('2026-03-21T10:00:00.000Z'),
    updatedAt: new Date('2026-03-21T10:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: exercisesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
  });

  describe('create', () => {
    it('delegates to exercisesService.create', async () => {
      exercisesServiceMock.create.mockResolvedValue(exerciseRecord);

      const result = await controller.create(createExerciseDto);

      expect(exercisesServiceMock.create).toHaveBeenCalledWith(
        createExerciseDto,
      );
      expect(result).toEqual(exerciseRecord);
    });
  });

  describe('findAll', () => {
    it('delegates to exercisesService.findAll', async () => {
      exercisesServiceMock.findAll.mockResolvedValue([exerciseRecord]);

      const result = await controller.findAll();

      expect(exercisesServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([exerciseRecord]);
    });
  });

  describe('findOne', () => {
    it('delegates to exercisesService.findOne', async () => {
      exercisesServiceMock.findOne.mockResolvedValue(exerciseRecord);

      const result = await controller.findOne(exerciseRecord.id);

      expect(exercisesServiceMock.findOne).toHaveBeenCalledWith(
        exerciseRecord.id,
      );
      expect(result).toEqual(exerciseRecord);
    });
  });

  describe('update', () => {
    it('delegates to exercisesService.update', async () => {
      exercisesServiceMock.update.mockResolvedValue({
        ...exerciseRecord,
        ...updateExerciseDto,
      });

      const result = await controller.update(exerciseRecord.id, updateExerciseDto);

      expect(exercisesServiceMock.update).toHaveBeenCalledWith(
        exerciseRecord.id,
        updateExerciseDto,
      );
      expect(result).toEqual({
        ...exerciseRecord,
        ...updateExerciseDto,
      });
    });
  });

  describe('remove', () => {
    it('delegates to exercisesService.remove', async () => {
      exercisesServiceMock.remove.mockResolvedValue(exerciseRecord);

      const result = await controller.remove(exerciseRecord.id);

      expect(exercisesServiceMock.remove).toHaveBeenCalledWith(
        exerciseRecord.id,
      );
      expect(result).toEqual(exerciseRecord);
    });
  });
});
