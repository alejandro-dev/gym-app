import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('@nestjs/throttler', () => ({
   SkipThrottle: () => () => undefined,
   Throttle: () => () => undefined,
   ThrottlerGuard: class {},
}));

describe('AuthController', () => {
   let controller: AuthController;
   const authServiceMock = {
      verifyEmail: jest.fn(),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         controllers: [AuthController],
         providers: [
            {
               provide: AuthService,
               useValue: authServiceMock,
            },
         ],
      }).compile();

      controller = module.get<AuthController>(AuthController);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });

   it('verifies email using the provided token', async () => {
      authServiceMock.verifyEmail.mockResolvedValue({
         message: 'Email verified successfully',
      });

      const result = await controller.verifyEmail({
         token: 'valid-token-value',
      });

      expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(
         'valid-token-value',
      );
      expect(result).toEqual({ message: 'Email verified successfully' });
   });
});
