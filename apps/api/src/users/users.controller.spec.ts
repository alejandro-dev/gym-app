import { Test, TestingModule } from '@nestjs/testing';
import type { UsersListResponse, User } from '@gym-app/types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
   let controller: UsersController;
   let usersService: {
      findAll: jest.Mock<Promise<UsersListResponse>, [number, number]>;
      findOne: jest.Mock<Promise<User>, [string]>;
      create: jest.Mock;
      update: jest.Mock;
      remove: jest.Mock;
   };

   beforeEach(async () => {
      usersService = {
         findAll: jest.fn(),
         findOne: jest.fn(),
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

      expect(usersService.findAll).toHaveBeenCalledWith(0, 10);
   });

   it('sanitizes invalid pagination values', async () => {
      usersService.findAll.mockResolvedValue({
         items: [],
         total: 0,
         page: 0,
         limit: 100,
      });

      await controller.findAll('-3', '1000');

      expect(usersService.findAll).toHaveBeenCalledWith(0, 100);
   });
});
