import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProducer } from '../bullmq/auth/auth.producer';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
   let service: AuthService;
   const prismaServiceMock = {
      user: {
         findMany: jest.fn(),
         update: jest.fn(),
      },
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
               useValue: {},
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
