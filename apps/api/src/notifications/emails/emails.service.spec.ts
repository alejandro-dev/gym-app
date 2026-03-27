import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailsService } from './emails.service';

describe('EmailsService', () => {
   let service: EmailsService;
   const verificationLinkMatcher = expect.stringContaining(
      'Verificar email',
   ) as unknown as string;
   const fallbackUrlMatcher = expect.stringContaining(
      'http://localhost:3001/auth/verify-email?token=fallback-token',
   ) as unknown as string;

   const mailerServiceMock: {
      sendMail: jest.Mock<Promise<void>, [Record<string, unknown>]>;
   } = {
      sendMail: jest.fn<Promise<void>, [Record<string, unknown>]>(),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            EmailsService,
            {
               provide: MailerService,
               useValue: mailerServiceMock,
            },
         ],
      }).compile();

      service = module.get<EmailsService>(EmailsService);
   });

   it('sends a welcome verification email with the first name', async () => {
      mailerServiceMock.sendMail.mockResolvedValue(undefined);

      await service.sendWelcomeVerificationEmail({
         email: 'alex@example.com',
         firstName: 'Alex',
         verificationUrl:
            'http://localhost:3001/auth/verify-email?token=abc123',
      });

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
         to: 'alex@example.com',
         subject: 'Bienvenido a Gym App - Verifica tu email',
         text: [
            'Hola Alex,',
            '',
            'Gracias por registrarte en Gym App.',
            'Para verificar tu correo, usa este enlace:',
            'http://localhost:3001/auth/verify-email?token=abc123',
            '',
            'Si no has creado esta cuenta, puedes ignorar este mensaje.',
         ].join('\n'),
         html: verificationLinkMatcher,
      });
   });

   it('uses a generic greeting when firstName is null', async () => {
      mailerServiceMock.sendMail.mockResolvedValue(undefined);

      await service.sendWelcomeVerificationEmail({
         email: 'user@example.com',
         firstName: null,
         verificationUrl:
            'http://localhost:3001/auth/verify-email?token=fallback-token',
      });

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
         to: 'user@example.com',
         subject: 'Bienvenido a Gym App - Verifica tu email',
         text: [
            'Hola,',
            '',
            'Gracias por registrarte en Gym App.',
            'Para verificar tu correo, usa este enlace:',
            'http://localhost:3001/auth/verify-email?token=fallback-token',
            '',
            'Si no has creado esta cuenta, puedes ignorar este mensaje.',
         ].join('\n'),
         html: fallbackUrlMatcher,
      });
   });
});
