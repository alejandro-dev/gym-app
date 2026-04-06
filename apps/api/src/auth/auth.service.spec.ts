import { Test, TestingModule } from '@nestjs/testing';
import {
   BadRequestException,
   ForbiddenException,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProducer } from '../bullmq/auth/auth.producer';
import { PrismaService } from '../prisma/prisma.service';
import { AccountOnboardingService } from './account-onboarding.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
   let service: AuthService;
   const prismaServiceMock = {
      user: {
         create: jest.fn(),
         findUnique: jest.fn(),
         findMany: jest.fn(),
         update: jest.fn(),
      },
   };

   const accountOnboardingServiceMock = {
      createEmailVerificationArtifacts: jest.fn(),
      enqueueWelcomeEmail: jest.fn(),
      issueTokens: jest.fn(),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AuthService,
            {
               provide: PrismaService,
               useValue: prismaServiceMock,
            },
            {
               provide: JwtService,
               useValue: {
                  verifyAsync: jest.fn(),
               },
            },
            {
               provide: ConfigService,
               useValue: {
                  get: jest.fn(),
               },
            },
            {
               provide: AuthProducer,
               useValue: {
                  enqueueUserRegistered: jest.fn(),
               },
            },
            {
               provide: AccountOnboardingService,
               useValue: accountOnboardingServiceMock,
            },
         ],
      }).compile();

      service = module.get<AuthService>(AuthService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   it('throws BadRequestException when verification token is missing', async () => {
      await expect(service.verifyEmail('')).rejects.toBeInstanceOf(
         BadRequestException,
      );
   });

   it('throws ForbiddenException when the user email is not verified during login', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'alex@example.com',
         username: 'alex',
         passwordHash: 'stored-hash',
         firstName: 'Alex',
         lastName: 'Doe',
         role: 'USER',
         weightKg: null,
         heightCm: null,
         birthDate: null,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
         updatedAt: new Date('2024-01-01T00:00:00.000Z'),
         emailVerifiedAt: null,
      });
      jest
         .spyOn(service as never, 'verifyValue')
         .mockResolvedValueOnce(true as never);

      await expect(
         service.login({
            email: 'alex@example.com',
            password: 'supersecreto123',
         }),
      ).rejects.toBeInstanceOf(ForbiddenException);
   });

   it('returns tokens when the user email is verified during login', async () => {
      const issuedTokens = {
         user: {
            id: 'user-1',
            email: 'alex@example.com',
            username: 'alex',
            firstName: 'Alex',
            lastName: 'Doe',
            role: 'USER',
            weightKg: null,
            heightCm: null,
            birthDate: null,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
         },
         accessToken: 'access-token',
         refreshToken: 'refresh-token',
      };

      prismaServiceMock.user.findUnique.mockResolvedValue({
         ...issuedTokens.user,
         passwordHash: 'stored-hash',
         emailVerifiedAt: new Date('2024-01-02T00:00:00.000Z'),
      });
      jest
         .spyOn(service as never, 'verifyValue')
         .mockResolvedValueOnce(true as never);
      jest
         .spyOn(accountOnboardingServiceMock, 'issueTokens')
         .mockResolvedValueOnce(issuedTokens);

      await expect(
         service.login({
            email: 'alex@example.com',
            password: 'supersecreto123',
         }),
      ).resolves.toEqual(issuedTokens);
   });

   it('verifies email and clears verification fields when token matches', async () => {
      prismaServiceMock.user.findMany.mockResolvedValue([
         {
            id: 'user-1',
            emailVerificationTokenHash: 'stored-hash',
         },
      ]);
      prismaServiceMock.user.update.mockResolvedValue(undefined);
      jest
         .spyOn(service as never, 'verifyValue')
         .mockResolvedValueOnce(true as never);

      await expect(service.verifyEmail('valid-token')).resolves.toEqual({
         message: 'Email verified successfully',
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalled();
      const updateCalls = (
         prismaServiceMock.user.update as jest.Mock<
            Promise<void>,
            [
               {
                  where: { id: string };
                  data: {
                     emailVerifiedAt: Date;
                     emailVerificationTokenHash: null;
                     emailVerificationExpiresAt: null;
                  };
               },
            ]
         >
      ).mock.calls;
      const [updateCallArgs] = updateCalls;
      const [updateCall] = updateCallArgs;
      const updateData = updateCall.data as {
         emailVerifiedAt: Date;
         emailVerificationTokenHash: null;
         emailVerificationExpiresAt: null;
      };

      expect(updateCall.where).toEqual({ id: 'user-1' });
      expect(updateData.emailVerifiedAt).toBeInstanceOf(Date);
      expect(updateData.emailVerificationTokenHash).toBeNull();
      expect(updateData.emailVerificationExpiresAt).toBeNull();
   });

   it('throws UnauthorizedException when verification token does not match', async () => {
      prismaServiceMock.user.findMany.mockResolvedValue([
         {
            id: 'user-1',
            emailVerificationTokenHash: 'stored-hash',
         },
      ]);
      jest
         .spyOn(service as never, 'verifyValue')
         .mockResolvedValueOnce(false as never);

      await expect(service.verifyEmail('invalid-token')).rejects.toBeInstanceOf(
         UnauthorizedException,
      );

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
   });
});
