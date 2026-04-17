import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import type { UsersListResponse, User } from '@gym-app/types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

type UsersServiceMock = {
   findAll: jest.MockedFunction<
      (
         currentUser: AuthenticatedUser,
         page: number,
         limit: number,
         search: string,
         role: UserRole | undefined,
      ) => Promise<UsersListResponse>
   >;
   findOne: jest.MockedFunction<
      (currentUser: AuthenticatedUser, id: string) => Promise<User>
   >;
   create: jest.MockedFunction<UsersService['create']>;
   update: jest.MockedFunction<UsersService['update']>;
   remove: jest.MockedFunction<UsersService['remove']>;
   changeStatus: jest.MockedFunction<UsersService['changeStatus']>;
};

describe('UsersController', () => {
   let controller: UsersController;
   let usersService: UsersServiceMock;
   const currentUser: AuthenticatedUser = {
      sub: 'coach_1',
      email: 'coach@gymapp.dev',
      role: UserRole.COACH,
      tokenType: 'access',
   };

   beforeEach(async () => {
      usersService = {
         findAll: jest.fn(
            (
               ...args: [
                  AuthenticatedUser,
                  number,
                  number,
                  string,
                  UserRole | undefined,
               ]
            ) => {
               void args;

               return Promise.resolve({
                  items: [],
                  total: 0,
                  page: 0,
                  limit: 10,
               });
            },
         ),
         findOne: jest.fn((...args: [AuthenticatedUser, string]) => {
            void args;

            return Promise.resolve({
               id: 'user_1',
               email: 'alex@gymapp.dev',
               username: null,
               firstName: null,
               lastName: null,
               role: 'USER',
               coachId: null,
               weightKg: null,
               heightCm: null,
               birthDate: null,
               emailVerifiedAt: null,
               isActive: true,
               createdAt: '2026-03-28T10:00:00.000Z',
               updatedAt: '2026-03-28T10:00:00.000Z',
            });
         }),
         create: jest.fn(),
         update: jest.fn(),
         remove: jest.fn(),
         changeStatus: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
         controllers: [UsersController],
         providers: [
            {
               provide: UsersService,
               useValue: usersService,
            },
         ],
      }).compile();

      controller = module.get<UsersController>(UsersController);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });

   it('uses default pagination values when query params are missing', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 10,
      });

      await controller.findAll(currentUser);

      expect(usersService.findAll).toHaveBeenCalledWith(
         currentUser,
         0,
         10,
         '',
         undefined,
      );
   });

   it('sanitizes invalid pagination values', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 100,
      });

      await controller.findAll(currentUser, '-3', '1000');

      expect(usersService.findAll).toHaveBeenCalledWith(
         currentUser,
         0,
         100,
         '',
         undefined,
      );
   });

   it('forwards the search term to the service', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 10,
      });

      await controller.findAll(currentUser, '0', '10', 'alex');

      expect(usersService.findAll).toHaveBeenCalledWith(
         currentUser,
         0,
         10,
         'alex',
         undefined,
      );
   });

   it('forwards the role filter to the service', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 10,
      });

      await controller.findAll(currentUser, '0', '10', 'alex', UserRole.ADMIN);

      expect(usersService.findAll).toHaveBeenCalledWith(
         currentUser,
         0,
         10,
         'alex',
         UserRole.ADMIN,
      );
   });

   it('delegates user creation to the service', async () => {
      usersService.create.mockResolvedValue({
         id: 'user_2',
         email: 'coach@gymapp.dev',
         username: 'coach',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
         coachId: null,
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: '2026-04-06T10:00:00.000Z',
         isActive: true,
         createdAt: '2026-04-06T10:00:00.000Z',
         updatedAt: '2026-04-06T10:00:00.000Z',
      });

      await controller.create(currentUser, {
         email: 'coach@gymapp.dev',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
      });

      expect(usersService.create).toHaveBeenCalledWith(currentUser, {
         email: 'coach@gymapp.dev',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
      });
   });

   it('delegates user lookup to the service with the authenticated coach', async () => {
      await controller.findOne(currentUser, 'user_1');

      expect(usersService.findOne).toHaveBeenCalledWith(currentUser, 'user_1');
   });

   it('delegates user status changes to the service with the authenticated user', async () => {
      usersService.changeStatus.mockResolvedValue({
         id: 'user_1',
         email: 'athlete@gymapp.dev',
         username: null,
         firstName: null,
         lastName: null,
         role: UserRole.USER,
         coachId: currentUser.sub,
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: null,
         isActive: false,
         createdAt: '2026-03-28T10:00:00.000Z',
         updatedAt: '2026-03-28T10:00:00.000Z',
      });

      await controller.changeStatus(currentUser, 'user_1', {
         isActive: false,
      });

      expect(usersService.changeStatus).toHaveBeenCalledWith(
         currentUser,
         'user_1',
         false,
      );
   });
});
