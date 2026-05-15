import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AUTH_JOBS, AUTH_QUEUE } from './auth-queue.constants';

// Define el tipo de datos de la tarea de envio de verificacion de email
export type UserRegisteredJobData = {
   userId: string;
   email: string;
   firstName: string | null;
   emailVerificationToken?: string;
   temporaryPassword?: string;
};

// Define el tipo de datos de la tarea de restablecimiento de contraseña
export type PasswordResetRequestedJobData = {
   userId: string;
   email: string;
   firstName: string | null;
   passwordResetToken: string;
};

/**
 * Producer de BullMQ para el envio de mensajes de verificacion de email.
 */
@Injectable()
export class AuthProducer {
   constructor(
      @InjectQueue(AUTH_QUEUE)
      private readonly authQueue: Queue,
   ) {}

   /**
    * Envia un mensaje de verificación de email para un usuario.
    *
    * @param data - Datos necesarios para enviar el mensaje
    */
   async enqueueUserRegistered(data: UserRegisteredJobData) {
      await this.authQueue.add(AUTH_JOBS.USER_REGISTERED, data, {
         // Intentamos 3 veces antes de que el mensaje falle
         attempts: 3,
         // Si falla, esperamos 2s antes de reintentar
         backoff: {
            type: 'exponential',
            delay: 2000,
         },
         // Eliminamos el mensaje cuando se complete o falla
         removeOnComplete: true,
         // No eliminamos el mensaje cuando falla para poder inspeccionar el error
         removeOnFail: false,
      });
   }

   /**
    * Envia un mensaje de restablecimiento de contraseña para un usuario.
    *
    * @param data - Datos necesarios para enviar el mensaje
    */
   async enqueuePasswordResetRequested(data: PasswordResetRequestedJobData) {
      await this.authQueue.add(AUTH_JOBS.PASSWORD_RESET_REQUESTED, data, {
         attempts: 3,
         backoff: {
            type: 'exponential',
            delay: 2000,
         },
         removeOnComplete: true,
         removeOnFail: false,
      });
   }
}
