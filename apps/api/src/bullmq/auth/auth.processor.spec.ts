import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { EmailsService } from '../../notifications/emails/emails.service';
import { UserRegisteredJobData } from './auth.producer';
import { AUTH_JOBS } from './auth-queue.constants';
import { AuthProcessor } from './auth.processor';

describe('AuthProcessor', () => {
   let processor: AuthProcessor;

   const emailsServiceMock = {
      sendWelcomeVerificationEmail: jest.fn(),
   };

   const configServiceMock = {
      get: jest.fn(),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AuthProcessor,
            {
               provide: EmailsService,
               useValue: emailsServiceMock,
            },
            {
               provide: ConfigService,
               useValue: configServiceMock,
            },
         ],
      }).compile();

      processor = module.get<AuthProcessor>(AuthProcessor);
   });

   it('builds the verification URL with APP_BASE_URL and sends the welcome email', async () => {
      configServiceMock.get.mockReturnValue('http://localhost:3000');
      emailsServiceMock.sendWelcomeVerificationEmail.mockResolvedValue(
         undefined,
      );

      await processor.process({
         name: AUTH_JOBS.USER_REGISTERED,
         data: {
            userId: 'user_123',
            email: 'alex@example.com',
            firstName: 'Alex',
            emailVerificationToken: 'token_123',
         },
      } as Job<UserRegisteredJobData>);

      expect(configServiceMock.get).toHaveBeenCalledWith(
         'APP_BASE_URL',
         'http://localhost:3000',
      );
      expect(
         emailsServiceMock.sendWelcomeVerificationEmail,
      ).toHaveBeenCalledWith({
         email: 'alex@example.com',
         firstName: 'Alex',
         verificationUrl:
            'http://localhost:3000/auth/verify-email?token=token_123',
      });
   });

   it('uses the fallback APP_BASE_URL when config does not provide one', async () => {
      configServiceMock.get.mockImplementation(
         (_key: string, defaultValue?: string) => defaultValue,
      );
      emailsServiceMock.sendWelcomeVerificationEmail.mockResolvedValue(
         undefined,
      );

      await processor.process({
         name: AUTH_JOBS.USER_REGISTERED,
         data: {
            userId: 'user_456',
            email: 'user@example.com',
            firstName: null,
            emailVerificationToken: 'fallback_token',
         },
      } as Job<UserRegisteredJobData>);

      expect(
         emailsServiceMock.sendWelcomeVerificationEmail,
      ).toHaveBeenCalledWith({
         email: 'user@example.com',
         firstName: null,
         verificationUrl:
            'http://localhost:3000/auth/verify-email?token=fallback_token',
      });
   });
});
