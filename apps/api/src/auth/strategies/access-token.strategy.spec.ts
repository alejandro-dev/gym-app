import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessTokenStrategy } from './access-token.strategy';

describe('AccessTokenStrategy', () => {
   let strategy: AccessTokenStrategy;
   let prismaService: {
      user: {
         findUnique: jest.Mock;
      };
   };

   beforeEach(async () => {
      prismaService = {
         user: {
            findUnique: jest.fn(),
         },
      };

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AccessTokenStrategy,
            {
               provide: PrismaService,
               useValue: prismaService,
            },
            {
               provide: ConfigService,
               useValue: {
                  get: jest.fn().mockReturnValue('test-access-secret'),
               },
            },
         ],
      }).compile();

      strategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
   });

   it('rejects non-access token payloads', async () => {
      await expect(
         strategy.validate({
            sub: 'user-1',
            email: 'user@example.com',
            role: UserRole.USER,
            tokenType: 'refresh',
         }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
   });

   it('rejects tokens for missing users', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
         strategy.validate({
            sub: 'missing-user',
            email: 'old@example.com',
            role: UserRole.USER,
            tokenType: 'access',
         }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
   });

   it('rejects tokens for inactive users', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'user@example.com',
         role: UserRole.USER,
         isActive: false,
      });

      await expect(
         strategy.validate({
            sub: 'user-1',
            email: 'user@example.com',
            role: UserRole.USER,
            tokenType: 'access',
         }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
   });

   it('returns fresh authenticated user data for active users', async () => {
      prismaService.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'fresh@example.com',
         role: UserRole.COACH,
         isActive: true,
      });

      await expect(
         strategy.validate({
            sub: 'user-1',
            email: 'stale@example.com',
            role: UserRole.USER,
            tokenType: 'access',
         }),
      ).resolves.toEqual({
         sub: 'user-1',
         email: 'fresh@example.com',
         role: UserRole.COACH,
         tokenType: 'access',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
         where: { id: 'user-1' },
         select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
         },
      });
   });
});
