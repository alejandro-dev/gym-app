import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { EmailsService } from '../../notifications/emails/emails.service';
import { AUTH_JOBS, AUTH_QUEUE } from './auth-queue.constants';
import {
   UserRegisteredJobData,
   PasswordResetRequestedJobData,
} from './auth.producer';

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

   async process(
      job: Job<UserRegisteredJobData | PasswordResetRequestedJobData>,
   ): Promise<void> {
      switch (job.name) {
         case AUTH_JOBS.USER_REGISTERED:
            await this.handleUserRegistered(job as Job<UserRegisteredJobData>);
            break;
         case AUTH_JOBS.PASSWORD_RESET_REQUESTED:
            await this.handlePasswordResetRequested(
               job as Job<PasswordResetRequestedJobData>,
            );
            break;
         default:
            this.logger.warn(`Job no manejado: ${job.name}`);
      }
   }

   // Evento del envío de un correo de bienvenida
   private async handleUserRegistered(job: Job<UserRegisteredJobData>) {
      const { email, firstName, emailVerificationToken, temporaryPassword } =
         job.data;

      if (temporaryPassword) {
         await this.emailsService.sendAdminCreatedAccountEmail({
            email,
            firstName,
            temporaryPassword,
         });

         this.logger.log(`Correo de alta administrativa enviado a ${email}`);
         return;
      }

      // Construimos la URL de verificación de email solo para el flujo de registro.
      const frontUrl = this.configService.get<string>(
         'FRONT_URL',
         'http://localhost:3001',
      );
      const verificationUrl = `${frontUrl}/auth/verify-email?token=${emailVerificationToken}`;

      // Enviamos un e-mail de verificación
      await this.emailsService.sendWelcomeVerificationEmail({
         email,
         firstName,
         verificationUrl,
      });

      this.logger.log(`Correo de verificacion enviado a ${email}`);
   }

   // Evento del envío de un correo de restablecimiento de contraseña
   private async handlePasswordResetRequested(
      job: Job<PasswordResetRequestedJobData>,
   ) {
      const { email, firstName, passwordResetToken } = job.data;
      const frontUrl = this.configService.get<string>(
         'FRONT_URL',
         'http://localhost:3001',
      );

      const resetUrl = `${frontUrl}/auth/reset-password?token=${passwordResetToken}`;

      await this.emailsService.sendPasswordResetEmail({
         email,
         firstName,
         resetUrl,
      });

      this.logger.log(`Correo de reset de contrasena enviado a ${email}`);
   }
}
