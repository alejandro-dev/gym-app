import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

jest.mock(
  'src/auth/guards/access-token.guard',
  () => ({ AccessTokenGuard: class {} }),
  {
    virtual: true,
  },
);
jest.mock('src/auth/guards/roles.guard', () => ({ RolesGuard: class {} }), {
  virtual: true,
});
jest.mock(
  'src/auth/decorators/roles.decorator',
  () => ({ Roles: () => () => undefined }),
  {
    virtual: true,
  },
);
jest.mock(
  'src/auth/decorators/current-user.decorator',
  () => ({ CurrentUser: () => () => undefined }),
  {
    virtual: true,
  },
);

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

type UpdateWorkoutSessionDto = Partial<
  Omit<CreateWorkoutSessionDto, 'userId' | 'startedAt'>
>;

describe('WorkoutSessionsController', () => {
  let controller: WorkoutSessionsController;
  const currentUser = {
    sub: 'user_123',
    email: 'user@example.com',
    role: UserRole.USER,
    tokenType: 'access' as const,
  };

  const workoutSessionsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    completeSession: jest.fn(),
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

    controller = module.get<WorkoutSessionsController>(
      WorkoutSessionsController,
    );
  });

  describe('create', () => {
    it('delegates to workoutSessionsService.create with plan', async () => {
      workoutSessionsServiceMock.create.mockResolvedValue(workoutSessionRecord);

      const result = await controller.create(createWorkoutSessionDto);

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

      await controller.create(createWorkoutSessionWithoutPlanDto);

      expect(workoutSessionsServiceMock.create).toHaveBeenCalledWith(
        createWorkoutSessionWithoutPlanDto,
      );
    });
  });

  describe('findAll', () => {
    it('delegates to workoutSessionsService.findAll', async () => {
      workoutSessionsServiceMock.findAll.mockResolvedValue([
        workoutSessionRecord,
      ]);

      const result = await controller.findAll(currentUser, undefined);

      expect(workoutSessionsServiceMock.findAll).toHaveBeenCalledWith(
        currentUser,
        undefined,
      );
      expect(result).toEqual([workoutSessionRecord]);
    });
  });

  describe('findOne', () => {
    it('delegates to workoutSessionsService.findOne', async () => {
      workoutSessionsServiceMock.findOne.mockResolvedValue(
        workoutSessionRecord,
      );

      const result = await controller.findOne(
        currentUser,
        workoutSessionRecord.id,
      );

      expect(workoutSessionsServiceMock.findOne).toHaveBeenCalledWith(
        currentUser,
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

      const result = await controller.update(
        currentUser,
        workoutSessionRecord.id,
        updateWorkoutSessionDto,
      );

      expect(workoutSessionsServiceMock.update).toHaveBeenCalledWith(
        currentUser,
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

      const result = await controller.remove(
        currentUser,
        workoutSessionRecord.id,
      );

      expect(workoutSessionsServiceMock.remove).toHaveBeenCalledWith(
        currentUser,
        workoutSessionRecord.id,
      );
      expect(result).toEqual(workoutSessionRecord);
    });
  });

  describe('completeSession', () => {
    it('delegates to workoutSessionsService.completeSession', async () => {
      workoutSessionsServiceMock.completeSession.mockResolvedValue(
        workoutSessionRecord,
      );

      const result = await controller.completeSession(
        currentUser,
        workoutSessionRecord.id,
      );

      expect(workoutSessionsServiceMock.completeSession).toHaveBeenCalledWith(
        currentUser,
        workoutSessionRecord.id,
      );
      expect(result).toEqual(workoutSessionRecord);
    });
  });
});
