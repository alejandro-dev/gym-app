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
         findUnique: jest.Mock;
         update: jest.Mock;
      };
   };
   const accountOnboardingServiceMock = {
      enqueueWelcomeEmail: jest.fn(),
   };
   const adminUser = {
      sub: 'admin_1',
      email: 'admin@gymapp.dev',
      role: UserRole.ADMIN,
      tokenType: 'access' as const,
   };
   const coachUser = {
      sub: 'coach_1',
      email: 'coach@gymapp.dev',
      role: UserRole.COACH,
      tokenType: 'access' as const,
   };

   beforeEach(async () => {
      prismaService = {
         user: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
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
            coachId: null,
            weightKg: 82.5,
            heightCm: 178,
            birthDate: new Date('1992-06-14T00:00:00.000Z'),
            emailVerifiedAt: new Date('2026-03-28T09:00:00.000Z'),
            createdAt: new Date('2026-03-28T10:00:00.000Z'),
            updatedAt: new Date('2026-03-28T12:00:00.000Z'),
         },
      ]);
      prismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(adminUser, 0, 10, 'alex', undefined);

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
               coachId: null,
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

   it('adds the role filter to the query when provided', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await service.findAll(adminUser, 0, 10, '', UserRole.ADMIN);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {
               role: UserRole.ADMIN,
            },
         }),
      );
      expect(prismaService.user.count).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {
               role: UserRole.ADMIN,
            },
         }),
      );
   });

   it('combines search and role filters in the query', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await service.findAll(adminUser, 0, 10, 'alex', UserRole.COACH);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {
               OR: [
                  { email: { contains: 'alex', mode: 'insensitive' } },
                  { username: { contains: 'alex', mode: 'insensitive' } },
                  { firstName: { contains: 'alex', mode: 'insensitive' } },
                  { lastName: { contains: 'alex', mode: 'insensitive' } },
               ],
               role: UserRole.COACH,
            },
         }),
      );
   });

   it('omits the role filter when it is not provided', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await service.findAll(adminUser, 0, 10, '', undefined);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {},
         }),
      );
   });

   it('creates an already verified user and enqueues the welcome email with temporary password', async () => {
      prismaService.user.create.mockResolvedValue({
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
         emailVerifiedAt: new Date('2026-04-06T10:00:00.000Z'),
         createdAt: new Date('2026-04-06T10:00:00.000Z'),
         updatedAt: new Date('2026-04-06T10:00:00.000Z'),
      });
      accountOnboardingServiceMock.enqueueWelcomeEmail.mockResolvedValue(
         undefined,
      );

      const result = await service.create(adminUser, {
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
      expect(createCall.data.coach).toBeUndefined();

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
         coachId: null,
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: '2026-04-06T10:00:00.000Z',
         createdAt: '2026-04-06T10:00:00.000Z',
         updatedAt: '2026-04-06T10:00:00.000Z',
      });
   });

   it('keeps the requested coach assignment when an admin creates an athlete', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: coachUser.sub,
         role: UserRole.COACH,
      });
      prismaService.user.create.mockResolvedValue({
         id: 'athlete_1',
         email: 'athlete@gymapp.dev',
         username: null,
         firstName: 'Laura',
         lastName: 'Atleta',
         role: UserRole.USER,
         coachId: coachUser.sub,
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

      await service.create(adminUser, {
         email: 'athlete@gymapp.dev',
         firstName: 'Laura',
         lastName: 'Atleta',
         role: UserRole.USER,
         coachId: coachUser.sub,
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
         where: { id: coachUser.sub },
         select: { id: true, role: true },
      });
      const createCalls = prismaService.user.create.mock.calls as Array<
         [Prisma.UserCreateArgs]
      >;
      const [createCall] = createCalls[0] ?? [];

      expect(createCall.data.coach).toEqual({
         connect: {
            id: coachUser.sub,
         },
      });
   });

   it('assigns created athletes to the authenticated coach', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: coachUser.sub,
         role: UserRole.COACH,
      });
      prismaService.user.create.mockResolvedValue({
         id: 'athlete_2',
         email: 'new-athlete@gymapp.dev',
         username: null,
         firstName: 'New',
         lastName: 'Athlete',
         role: UserRole.USER,
         coachId: coachUser.sub,
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

      await service.create(coachUser, {
         email: 'new-athlete@gymapp.dev',
         firstName: 'New',
         lastName: 'Athlete',
         role: UserRole.USER,
      });

      const createCalls = prismaService.user.create.mock.calls as Array<
         [Prisma.UserCreateArgs]
      >;
      const [createCall] = createCalls[0] ?? [];

      expect(createCall.data.coach).toEqual({
         connect: {
            id: coachUser.sub,
         },
      });
   });

   it('rejects coach creation of non-athlete users', async () => {
      await expect(
         service.create(coachUser, {
            email: 'admin-from-coach@gymapp.dev',
            role: UserRole.ADMIN,
         }),
      ).rejects.toThrow('Coaches can only create users with role USER.');

      expect(prismaService.user.create).not.toHaveBeenCalled();
   });

   it('restricts coach listings to assigned athletes', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await service.findAll(coachUser, 0, 10, 'laura', UserRole.COACH);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where: {
               role: UserRole.USER,
               coachId: coachUser.sub,
               OR: [
                  { email: { contains: 'laura', mode: 'insensitive' } },
                  { username: { contains: 'laura', mode: 'insensitive' } },
                  { firstName: { contains: 'laura', mode: 'insensitive' } },
                  { lastName: { contains: 'laura', mode: 'insensitive' } },
               ],
            },
         }),
      );
   });

   it('allows a coach to fetch an assigned athlete', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: 'athlete_1',
         email: 'athlete@gymapp.dev',
         username: null,
         firstName: 'Laura',
         lastName: 'Atleta',
         role: UserRole.USER,
         coachId: coachUser.sub,
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: null,
         createdAt: new Date('2026-03-28T10:00:00.000Z'),
         updatedAt: new Date('2026-03-28T10:00:00.000Z'),
      });

      const result = await service.findOne(coachUser, 'athlete_1');

      expect(result.coachId).toBe(coachUser.sub);
   });

   it('rejects coach access to users not assigned to them', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: 'athlete_2',
         email: 'athlete2@gymapp.dev',
         username: null,
         firstName: 'Mario',
         lastName: 'Atleta',
         role: UserRole.USER,
         coachId: 'other_coach',
         weightKg: null,
         heightCm: null,
         birthDate: null,
         emailVerifiedAt: null,
         createdAt: new Date('2026-03-28T10:00:00.000Z'),
         updatedAt: new Date('2026-03-28T10:00:00.000Z'),
      });

      await expect(service.findOne(coachUser, 'athlete_2')).rejects.toThrow(
         'User with id "athlete_2" not found',
      );
   });
});
