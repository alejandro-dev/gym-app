import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseCategory, PersonalRecordMetric } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WORKOUT_JOBS } from './workout-queue.constants';
import { WorkoutProcessor } from './workout.processor';

describe('WorkoutProcessor', () => {
  let processor: WorkoutProcessor;
  type WorkoutCompletedJob = Parameters<WorkoutProcessor['process']>[0];

  const prismaMock = {
    workoutSession: {
      findUnique: jest.fn(),
    },
    personalRecord: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutProcessor,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    processor = module.get<WorkoutProcessor>(WorkoutProcessor);
  });

  it('creates new strength personal records when the session improves them', async () => {
    prismaMock.workoutSession.findUnique.mockResolvedValue({
      id: 'session_123',
      userId: 'user_123',
      startedAt: new Date('2026-03-25T10:00:00.000Z'),
      endedAt: new Date('2026-03-25T11:00:00.000Z'),
      sets: [
        {
          exerciseId: 'exercise_123',
          reps: 5,
          weightKg: 100,
          distanceMeters: null,
          durationSeconds: null,
          exercise: { category: ExerciseCategory.STRENGTH },
        },
        {
          exerciseId: 'exercise_123',
          reps: 1,
          weightKg: 110,
          distanceMeters: null,
          durationSeconds: null,
          exercise: { category: ExerciseCategory.STRENGTH },
        },
      ],
    });
    prismaMock.personalRecord.findFirst
      .mockResolvedValueOnce({ id: 'pr_1', value: 105 })
      .mockResolvedValueOnce({ id: 'pr_2', value: 100 });

    const job = {
      name: WORKOUT_JOBS.COMPLETED,
      data: { workoutSessionId: 'session_123', userId: 'user_123' },
    } as unknown as WorkoutCompletedJob;

    await processor.process(job);

    expect(prismaMock.personalRecord.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'user_123',
        exerciseId: 'exercise_123',
        metric: PersonalRecordMetric.MAX_WEIGHT,
      },
      orderBy: [{ value: 'desc' }, { achievedAt: 'desc' }],
      select: { id: true, value: true },
    });
    expect(prismaMock.personalRecord.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'user_123',
        exerciseId: 'exercise_123',
        metric: PersonalRecordMetric.ESTIMATED_1RM,
      },
      orderBy: [{ value: 'desc' }, { achievedAt: 'desc' }],
      select: { id: true, value: true },
    });
    expect(prismaMock.personalRecord.create).toHaveBeenCalledTimes(2);
  });

  it('does not create a personal record when the candidate does not improve the previous one', async () => {
    prismaMock.workoutSession.findUnique.mockResolvedValue({
      id: 'session_456',
      userId: 'user_123',
      startedAt: new Date('2026-03-25T10:00:00.000Z'),
      endedAt: new Date('2026-03-25T11:00:00.000Z'),
      sets: [
        {
          exerciseId: 'exercise_999',
          reps: 20,
          weightKg: null,
          distanceMeters: null,
          durationSeconds: null,
          exercise: { category: ExerciseCategory.BODYWEIGHT },
        },
      ],
    });
    prismaMock.personalRecord.findFirst.mockResolvedValue({
      id: 'pr_existing',
      value: 25,
    });

    const job = {
      name: WORKOUT_JOBS.COMPLETED,
      data: { workoutSessionId: 'session_456', userId: 'user_123' },
    } as unknown as WorkoutCompletedJob;

    await processor.process(job);

    expect(prismaMock.personalRecord.create).not.toHaveBeenCalled();
  });
});
