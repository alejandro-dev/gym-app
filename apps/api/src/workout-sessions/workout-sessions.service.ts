import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutProducer } from '../bullmq/workout.producer';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Servicio base para operaciones del dominio de sesiones de entrenamiento.
 */
@Injectable()
export class WorkoutSessionsService {
   /**
    * Crea una nueva instancia del servicio de ejercicios.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicación
    */
   constructor(private readonly prisma: PrismaService, private readonly workoutProducer: WorkoutProducer) {}

   /**
    * Selecciona los campos de una sesion de entrenamiento para la consulta.
    */
   private readonly workoutSessionSelect = {
      id: true,
      userId: true,
      workoutPlanId: true,
      name: true,
      notes: true,
      startedAt: true,
      endedAt: true,
   } satisfies Prisma.WorkoutSessionSelect;

   /**
    * Obtiene todos las sesiones de entrenamiento ordenadas por fecha de creacion descendente.
    * Si el usuario es un admin o coach, devuelve todas las sesiones si no filtra por usuario.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de sesiones accesibles para el usuario autenticado
    */
   async findAll(user: AuthenticatedUser, userId: string) {
      return await this.prisma.workoutSession.findMany({
         select: this.workoutSessionSelect,
         where: user.role === UserRole.USER ? { userId: user.sub } : userId ? { userId: userId } : undefined,
         orderBy: {
            createdAt: 'desc',
         },
      });
   }

   /**
    * Obtiene una sesion de entrenamiento por id.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento encontrada
    * @throws NotFoundException si no existe
    */
   async findOne(user: AuthenticatedUser, id: string) {
      const workoutSession = await this.prisma.workoutSession.findUnique({
         where: { id, userId: user.role === UserRole.ADMIN || user.role === UserRole.COACH ? undefined : user.sub },
         select: this.workoutSessionSelect,
      });

      // Si no existe lanza NotFoundException
      if (!workoutSession) throw new NotFoundException(`Workout session with id "${id}" not found`);
      return workoutSession;
   }

   /**
    * Crea una nueva sesion de entrenamiento y devuelve la version publica del registro.
    *
    * @param createWorkoutSessionDto - Datos de creacion de la sesion de entrenamiento
    * @returns Sesion de entrenamiento creada
    */
   async create(createWorkoutSessionDto: CreateWorkoutSessionDto) {
      try {
         return await this.prisma.workoutSession.create({
            data: this.toCreateData(createWorkoutSessionDto),
            select: this.workoutSessionSelect,
         });

      } catch (error) {
         handlePrismaError(error, 'workout session');
      }
   }

   /**
    * Actualiza una sesion de entrenamiento existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @param updateWorkoutSessionDto - Datos de actualizacion parcial
    * @returns Sesion de entrenamiento actualizada
    * @throws NotFoundException si la sesion no existe
    */
   async update(user: AuthenticatedUser, id: string, updateWorkoutSessionDto: UpdateWorkoutSessionDto) {
      // Verificamos si la sesion existe
      await this.getWorkoutSessionForUser(user, id);

      try {
         return await this.prisma.workoutSession.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutSessionDto),
            select: this.workoutSessionSelect,
         });

      } catch (error) {
         handlePrismaError(error, 'workout session');
      }
   }

   /**
    * Elimina una sesion de entrenamiento existente y devuelve el registro eliminado.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento eliminada
    * @throws NotFoundException si no existe
    */
   async remove(user: AuthenticatedUser, id: string) {
      // Verificamos si la sesion existe
      await this.getWorkoutSessionForUser(user, id);

      return await this.prisma.workoutSession.delete({
         where: { id },
         select: this.workoutSessionSelect,
      });
   }

   /**
    * Completa una sesion de entrenamiento.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento completada
    * @throws NotFoundException si no existe
    */
   async completeSession(user: AuthenticatedUser, id: string) {
      const existingSession = await this.getWorkoutSessionForUser(user, id);

      if (existingSession.endedAt) {
         throw new ConflictException(`Workout session with id "${id}" is already completed`);
      }

      const session = await this.prisma.workoutSession.update({
         where: { id },
         data: {
            endedAt: new Date()
         },
         select: this.workoutSessionSelect,
      });

      // En el canal de workouts, enviamos un mensaje de completado
      await this.workoutProducer.enqueueWorkoutCompleted(session.id, session.userId);

      return session;
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createWorkoutSessionDto - Datos de creacion de la sesion de entrenamiento
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(createWorkoutSessionDto: CreateWorkoutSessionDto): Prisma.WorkoutSessionCreateInput {
      return {
         user: {
            connect: {
               id: createWorkoutSessionDto.userId,
            },
         },
         name: createWorkoutSessionDto.name,
         notes: createWorkoutSessionDto.notes,
         startedAt: new Date(createWorkoutSessionDto.startedAt),
         endedAt: createWorkoutSessionDto.endedAt
            ? new Date(createWorkoutSessionDto.endedAt)
            : createWorkoutSessionDto.endedAt,
         ...(createWorkoutSessionDto.workoutPlanId
            ? {
                 workoutPlan: {
                    connect: {
                       id: createWorkoutSessionDto.workoutPlanId,
                    },
                 },
              }
            : {}),
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
    *
    * @param updateWorkoutSessionDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(updateWorkoutSessionDto: UpdateWorkoutSessionDto): Prisma.WorkoutSessionUpdateInput {
      return {
         name: updateWorkoutSessionDto.name,
         notes: updateWorkoutSessionDto.notes,
         endedAt:
            updateWorkoutSessionDto.endedAt === undefined
               ? undefined
               : updateWorkoutSessionDto.endedAt === null
                  ? null
                  : new Date(updateWorkoutSessionDto.endedAt),
         workoutPlan:
            updateWorkoutSessionDto.workoutPlanId === undefined
               ? undefined
               : updateWorkoutSessionDto.workoutPlanId === null
                  ? {
                       disconnect: true,
                    }
                  : {
                       connect: {
                          id: updateWorkoutSessionDto.workoutPlanId,
                       },
                    },
      };
   }

   /**
    * Obtiene una sesion de entrenamiento accesible para el usuario autenticado.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento encontrada
    * @throws NotFoundException si no existe
    */
   private async getWorkoutSessionForUser(user: AuthenticatedUser, id: string) {
      const workoutSession = await this.prisma.workoutSession.findUnique({
         where: { id, userId: user.role === UserRole.USER ? user.sub : undefined },
         select: { id: true, userId: true, endedAt: true },
      });

      if (!workoutSession) throw new NotFoundException(`Workout session with id "${id}" not found`);

      return workoutSession;
   }
}
