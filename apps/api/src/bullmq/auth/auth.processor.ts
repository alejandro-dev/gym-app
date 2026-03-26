import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { EmailsService } from '../../notifications/emails/emails.service';
import { AUTH_JOBS, AUTH_QUEUE } from './auth-queue.constants';
import { UserRegisteredJobData } from './auth.producer';

/**
 * Procesador de BullMQ para el envio de mensajes de verificación de email.
 */
@Processor(AUTH_QUEUE)
export class AuthProcessor extends WorkerHost {
   private readonly logger = new Logger(AuthProcessor.name);

   /**
    * Crea una nueva instancia del procesador de BullMQ.
    *
    * @param emailsService - Servicio de envío de e-mails
    */
   constructor(
      private readonly emailsService: EmailsService,
      private readonly configService: ConfigService,
   ) {
      super();
   }

   async process(job: Job<UserRegisteredJobData>): Promise<void> {
      switch (job.name) {
         case AUTH_JOBS.USER_REGISTERED:
            await this.handleUserRegistered(job);
            break;
         default:
            this.logger.warn(`Job no manejado: ${job.name}`);
      }
   }

   private async handleUserRegistered(job: Job<UserRegisteredJobData>) {
      const { email, firstName, emailVerificationToken } = job.data;

      // Construimos la URL de verificación de email
      const appBaseUrl = this.configService.get<string>(
         'APP_BASE_URL',
         'http://localhost:3000',
      );

      // La URL de verificación de email es la base de la aplicación + el token de verificación
      const verificationUrl = `${appBaseUrl}/auth/verify-email?token=${emailVerificationToken}`;

      // Enviamos un e-mail de verificación
      await this.emailsService.sendWelcomeVerificationEmail({
         email,
         firstName,
         verificationUrl,
      });

      this.logger.log(`Correo de verificacion enviado a ${email}`);
   }
}
