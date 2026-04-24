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
         isActive: true,
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
            isActive: true,
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

   it('throws ForbiddenException when an inactive user tries to login', async () => {
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
         isActive: false,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
         updatedAt: new Date('2024-01-01T00:00:00.000Z'),
         emailVerifiedAt: new Date('2024-01-02T00:00:00.000Z'),
      });

      await expect(
         service.login({
            email: 'alex@example.com',
            password: 'supersecreto123',
         }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(accountOnboardingServiceMock.issueTokens).not.toHaveBeenCalled();
   });

   it('throws UnauthorizedException when refresh token user does not exist', async () => {
      jest.spyOn(service as never, 'verifyToken').mockResolvedValueOnce({
         sub: 'missing-user',
         email: 'missing@example.com',
         role: 'USER',
         tokenType: 'refresh',
      } as never);
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(
         service.refreshTokens('refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
   });

   it('throws ForbiddenException when inactive user refreshes tokens', async () => {
      jest.spyOn(service as never, 'verifyToken').mockResolvedValueOnce({
         sub: 'user-1',
         email: 'alex@example.com',
         role: 'USER',
         tokenType: 'refresh',
      } as never);
      prismaServiceMock.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'alex@example.com',
         username: 'alex',
         firstName: 'Alex',
         lastName: 'Doe',
         role: 'USER',
         weightKg: null,
         heightCm: null,
         birthDate: null,
         isActive: false,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
         updatedAt: new Date('2024-01-01T00:00:00.000Z'),
         hashedRefreshToken: 'stored-refresh-hash',
      });

      await expect(
         service.refreshTokens('refresh-token'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(accountOnboardingServiceMock.issueTokens).not.toHaveBeenCalled();
   });

   it('returns new tokens when refresh token belongs to an active user', async () => {
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
         accessToken: 'new-access-token',
         refreshToken: 'new-refresh-token',
      };

      jest.spyOn(service as never, 'verifyToken').mockResolvedValueOnce({
         sub: 'user-1',
         email: 'alex@example.com',
         role: 'USER',
         tokenType: 'refresh',
      } as never);
      jest
         .spyOn(service as never, 'verifyValue')
         .mockResolvedValueOnce(true as never);
      prismaServiceMock.user.findUnique.mockResolvedValue({
         ...issuedTokens.user,
         isActive: true,
         hashedRefreshToken: 'stored-refresh-hash',
      });
      accountOnboardingServiceMock.issueTokens.mockResolvedValueOnce(
         issuedTokens,
      );

      await expect(service.refreshTokens('refresh-token')).resolves.toEqual(
         issuedTokens,
      );
      expect(accountOnboardingServiceMock.issueTokens).toHaveBeenCalledWith(
         issuedTokens.user,
      );
   });

   it('updates the authenticated profile editable fields', async () => {
      const updatedUser = {
         id: 'user-1',
         email: 'alex@example.com',
         username: 'alex',
         firstName: 'Alex',
         lastName: 'Garcia',
         role: 'USER',
         weightKg: 82.5,
         heightCm: 180,
         birthDate: new Date('1995-06-20T00:00:00.000Z'),
         isActive: true,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
         updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      };

      prismaServiceMock.user.findUnique.mockResolvedValueOnce({ id: 'user-1' });
      prismaServiceMock.user.update.mockResolvedValueOnce(updatedUser);

      await expect(
         service.updateProfile('user-1', {
            firstName: 'Alex',
            lastName: 'Garcia',
            weightKg: 82.5,
            heightCm: 180,
            birthDate: '1995-06-20T00:00:00.000Z',
         }),
      ).resolves.toEqual(updatedUser);

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith(
         expect.objectContaining({
            where: { id: 'user-1' },
            data: {
               firstName: 'Alex',
               lastName: 'Garcia',
               weightKg: 82.5,
               heightCm: 180,
               birthDate: new Date('1995-06-20T00:00:00.000Z'),
            },
         }),
      );
   });

   it('throws UnauthorizedException when updating a missing profile', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
         service.updateProfile('missing-user', {
            firstName: 'Alex',
         }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
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
