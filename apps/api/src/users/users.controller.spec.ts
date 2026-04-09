import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import type { UsersListResponse, User } from '@gym-app/types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type UsersServiceMock = {
   findAll: jest.MockedFunction<
      (
         page: number,
         limit: number,
         search: string,
         role: UserRole | undefined,
      ) => Promise<UsersListResponse>
   >;
   findOne: jest.MockedFunction<(id: string) => Promise<User>>;
   create: jest.MockedFunction<UsersService['create']>;
   update: jest.MockedFunction<UsersService['update']>;
   remove: jest.MockedFunction<UsersService['remove']>;
};

describe('UsersController', () => {
   let controller: UsersController;
   let usersService: UsersServiceMock;

   beforeEach(async () => {
      usersService = {
         findAll: jest.fn(
            (...args: [number, number, string, UserRole | undefined]) => {
               void args;

               return Promise.resolve({
                  items: [],
                  total: 0,
                  page: 0,
                  limit: 10,
               });
            },
         ),
         findOne: jest.fn((...args: [string]) => {
            void args;

            return Promise.resolve({
               id: 'user_1',
               email: 'alex@gymapp.dev',
               username: null,
               firstName: null,
               lastName: null,
               role: 'USER',
               weightKg: null,
               heightCm: null,
               birthDate: null,
               emailVerifiedAt: null,
               createdAt: '2026-03-28T10:00:00.000Z',
               updatedAt: '2026-03-28T10:00:00.000Z',
            });
         }),
         create: jest.fn(),
         update: jest.fn(),
         remove: jest.fn(),
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

      await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalledWith(0, 10, '', undefined);
   });

   it('sanitizes invalid pagination values', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 100,
      });

      await controller.findAll('-3', '1000');

      expect(usersService.findAll).toHaveBeenCalledWith(0, 100, '', undefined);
   });

   it('forwards the search term to the service', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 10,
      });

      await controller.findAll('0', '10', 'alex');

      expect(usersService.findAll).toHaveBeenCalledWith(
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

      await controller.findAll('0', '10', 'alex', UserRole.ADMIN);

      expect(usersService.findAll).toHaveBeenCalledWith(
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
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: '2026-04-06T10:00:00.000Z',
         createdAt: '2026-04-06T10:00:00.000Z',
         updatedAt: '2026-04-06T10:00:00.000Z',
      });

      await controller.create({
         email: 'coach@gymapp.dev',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
      });

      expect(usersService.create).toHaveBeenCalledWith({
         email: 'coach@gymapp.dev',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
      });
   });
});
