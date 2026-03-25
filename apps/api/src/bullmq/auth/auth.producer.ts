import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AUTH_JOBS, AUTH_QUEUE } from './auth-queue.constants';

// Define el tipo de datos de la tarea de envio de verificacion de email
export type UserRegisteredJobData = {
  userId: string;
  email: string;
  firstName: string | null;
  emailVerificationToken: string;
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
}
