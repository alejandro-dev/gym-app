import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { AccountOnboardingService } from '../auth/account-onboarding.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
   let service: UsersService;
   let prismaService: {
      user: {
         create: jest.Mock;
         findMany: jest.Mock;
         count: jest.Mock;
      };
   };
   const accountOnboardingServiceMock = {
      enqueueWelcomeEmail: jest.fn(),
   };

   beforeEach(async () => {
      prismaService = {
         user: {
            create: jest.fn(),
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
            {
               provide: AccountOnboardingService,
               useValue: accountOnboardingServiceMock,
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
            emailVerifiedAt: new Date('2026-03-28T09:00:00.000Z'),
            createdAt: new Date('2026-03-28T10:00:00.000Z'),
            updatedAt: new Date('2026-03-28T12:00:00.000Z'),
         },
      ]);
      prismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(0, 10, 'alex');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {
               OR: [
                  { email: { contains: 'alex', mode: 'insensitive' } },
                  { username: { contains: 'alex', mode: 'insensitive' } },
                  { firstName: { contains: 'alex', mode: 'insensitive' } },
                  { lastName: { contains: 'alex', mode: 'insensitive' } },
               ],
            },
         }),
      );

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
               emailVerifiedAt: '2026-03-28T09:00:00.000Z',
               createdAt: '2026-03-28T10:00:00.000Z',
               updatedAt: '2026-03-28T12:00:00.000Z',
            },
         ],
         total: 1,
         page: 0,
         limit: 10,
      });
   });

   it('creates an already verified user and enqueues the welcome email with temporary password', async () => {
      prismaService.user.create.mockResolvedValue({
         id: 'user_2',
         email: 'coach@gymapp.dev',
         username: 'coach',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: new Date('2026-04-06T10:00:00.000Z'),
         createdAt: new Date('2026-04-06T10:00:00.000Z'),
         updatedAt: new Date('2026-04-06T10:00:00.000Z'),
      });
      accountOnboardingServiceMock.enqueueWelcomeEmail.mockResolvedValue(
         undefined,
      );

      const result = await service.create({
         email: 'coach@gymapp.dev',
         firstName: 'Coach',
         lastName: 'Admin',
         role: UserRole.COACH,
      });

      expect(prismaService.user.create).toHaveBeenCalled();
      const createCalls = prismaService.user.create.mock.calls as Array<
         [Prisma.UserCreateArgs]
      >;
      const [createCall] = createCalls[0] ?? [];

      expect(createCall.data.emailVerifiedAt).toBeInstanceOf(Date);
      expect(typeof createCall.data.passwordHash).toBe('string');
      expect(createCall.data.passwordHash).toContain(':');

      const welcomeEmailCalls = accountOnboardingServiceMock.enqueueWelcomeEmail
         .mock.calls as Array<
         [
            {
               userId: string;
               email: string;
               firstName: string | null;
               temporaryPassword?: string;
            },
         ]
      >;
      const [welcomeEmailCall] = welcomeEmailCalls[0] ?? [];

      expect(welcomeEmailCall.userId).toBe('user_2');
      expect(welcomeEmailCall.email).toBe('coach@gymapp.dev');
      expect(welcomeEmailCall.firstName).toBe('Coach');
      expect(typeof welcomeEmailCall.temporaryPassword).toBe('string');

      expect(result).toEqual({
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
   });
});
