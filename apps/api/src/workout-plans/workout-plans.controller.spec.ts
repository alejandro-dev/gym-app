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
   const currentUser = {
      sub: 'user_123',
      email: 'user@example.com',
      role: UserRole.USER,
      tokenType: 'access' as const,
   };

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
      createdById: currentUser.sub,
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

         const result = await controller.create(
            currentUser,
            createWorkoutPlanDto,
         );

         expect(workoutPlansServiceMock.create).toHaveBeenCalledWith(
            currentUser,
            createWorkoutPlanDto,
         );
         expect(result).toEqual(workoutPlanRecord);
      });
   });

   describe('findAll', () => {
      it('delegates to workoutPlansService.findAll', async () => {
         workoutPlansServiceMock.findAll.mockResolvedValue([workoutPlanRecord]);

         const result = await controller.findAll(currentUser, undefined);

         expect(workoutPlansServiceMock.findAll).toHaveBeenCalledWith(
            currentUser,
            0,
            10,
            '',
            undefined,
         );
         expect(result).toEqual([workoutPlanRecord]);
      });
   });

   describe('findOne', () => {
      it('delegates to workoutPlansService.findOne', async () => {
         workoutPlansServiceMock.findOne.mockResolvedValue(workoutPlanRecord);

         const result = await controller.findOne(
            currentUser,
            workoutPlanRecord.id,
         );

         expect(workoutPlansServiceMock.findOne).toHaveBeenCalledWith(
            currentUser,
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

         const result = await controller.update(
            currentUser,
            workoutPlanRecord.id,
            updatedWorkoutPlanDto,
         );

         expect(workoutPlansServiceMock.update).toHaveBeenCalledWith(
            currentUser,
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

         const result = await controller.remove(
            currentUser,
            workoutPlanRecord.id,
         );

         expect(workoutPlansServiceMock.remove).toHaveBeenCalledWith(
            currentUser,
            workoutPlanRecord.id,
         );
         expect(result).toEqual(workoutPlanRecord);
      });
   });
});
