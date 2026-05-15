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
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
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

   it('changes the authenticated user password', async () => {
      authServiceMock.changePassword.mockResolvedValue({
         message: 'Password updated successfully',
      });

      const result = await controller.changePassword(
         {
            sub: 'user-1',
            email: 'alex@example.com',
            role: 'USER',
            tokenType: 'access',
         },
         {
            currentPassword: 'supersecreto123',
            newPassword: 'nuevasegura123',
         },
      );

      expect(authServiceMock.changePassword).toHaveBeenCalledWith('user-1', {
         currentPassword: 'supersecreto123',
         newPassword: 'nuevasegura123',
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
   });

   it('requests a password reset email', async () => {
      authServiceMock.forgotPassword.mockResolvedValue({
         message:
            'Si el usuario existe, se ha enviado un correo con instrucciones para restablecer la contraseña',
      });

      const result = await controller.forgotPassword({
         email: 'alex@example.com',
      });

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith({
         email: 'alex@example.com',
      });
      expect(result).toEqual({
         message:
            'Si el usuario existe, se ha enviado un correo con instrucciones para restablecer la contraseña',
      });
   });

   it('resets a password with a token', async () => {
      authServiceMock.resetPassword.mockResolvedValue({
         message: 'Password reset successfully',
      });

      const result = await controller.resetPassword({
         token: 'valid-reset-token',
         newPassword: 'nuevasegura123',
      });

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith({
         token: 'valid-reset-token',
         newPassword: 'nuevasegura123',
      });
      expect(result).toEqual({ message: 'Password reset successfully' });
   });
});
