import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
   let service: UsersService;
   let prismaService: {
      user: {
         findMany: jest.Mock;
         count: jest.Mock;
      };
   };

   beforeEach(async () => {
      prismaService = {
         user: {
            findMany: jest.fn(),
            count: jest.fn(),
         },
      };

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            UsersService,
            {
               provide: PrismaService,
               useValue: prismaService,
            },
         ],
      }).compile();

      service = module.get<UsersService>(UsersService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   it('returns paginated users with ISO dates', async () => {
      prismaService.user.findMany.mockResolvedValue([
         {
            id: 'user_1',
            email: 'alex@gymapp.dev',
            username: 'alex',
            firstName: 'Alex',
            lastName: 'Trainer',
            role: UserRole.ADMIN,
            weightKg: 82.5,
            heightCm: 178,
            birthDate: new Date('1992-06-14T00:00:00.000Z'),
            createdAt: new Date('2026-03-28T10:00:00.000Z'),
            updatedAt: new Date('2026-03-28T12:00:00.000Z'),
         },
      ]);
      prismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(0, 10);

      expect(result).toEqual({
         items: [
            {
               id: 'user_1',
               email: 'alex@gymapp.dev',
               username: 'alex',
               firstName: 'Alex',
               lastName: 'Trainer',
               role: UserRole.ADMIN,
               weightKg: 82.5,
               heightCm: 178,
               birthDate: '1992-06-14T00:00:00.000Z',
               createdAt: '2026-03-28T10:00:00.000Z',
               updatedAt: '2026-03-28T12:00:00.000Z',
            },
         ],
         total: 1,
         page: 0,
         limit: 10,
      });
   });
});
