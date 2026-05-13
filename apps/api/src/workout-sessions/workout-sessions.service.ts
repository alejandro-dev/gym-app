import {
   ConflictException,
   Injectable,
   Logger,
   NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutProducer } from '../bullmq/workout/workout.producer';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import type {
   WorkoutSession,
   WorkoutSessionFeedItem,
   WorkoutSessionFeedListResponse,
} from '@gym-app/types';
import {
   completedWorkoutSessionFeedSelect,
   toWorkoutSessionFeedItem,
} from './workout-session-feed.mapper';
import { CompleteWorkoutSessionDto } from './dto/complete-workout-session.dto';

type SelectedWorkoutSessionRecord = {
   id: string;
   userId: string;
   workoutPlanId: string | null;
   name: string;
   notes: string | null;
   startedAt: Date;
   endedAt: Date | null;
   sets: {
      reps: number | null;
      weightKg: number | null;
   }[];
};

/**
 * Servicio base para operaciones del dominio de sesiones de entrenamiento.
 */
@Injectable()
export class WorkoutSessionsService {
   private readonly logger = new Logger(WorkoutSessionsService.name);

   /**
    * Crea una nueva instancia del servicio de ejercicios.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicación
    */
   constructor(
      private readonly prisma: PrismaService,
      private readonly workoutProducer: WorkoutProducer,
   ) {}

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
      sets: {
         where: { isCompleted: true },
         select: {
            reps: true,
            weightKg: true,
         },
      },
   } satisfies Prisma.WorkoutSessionSelect;

   /**
    * Obtiene todos las sesiones de entrenamiento ordenadas por fecha de creacion descendente.
    * Si el usuario es un admin o coach, devuelve todas las sesiones si no filtra por usuario.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de sesiones accesibles para el usuario autenticado
    */
   async findAll(user: AuthenticatedUser, userId?: string) {
      const workoutSessions = await this.prisma.workoutSession.findMany({
         select: this.workoutSessionSelect,
         where:
            user.role === UserRole.USER
               ? { userId: user.sub }
               : userId
                 ? { userId: userId }
                 : undefined,
         orderBy: {
            createdAt: 'desc',
         },
      });

      return workoutSessions.map((workoutSession) =>
         this.toPublicWorkoutSession(workoutSession),
      );
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
         where: {
            id,
            userId:
               user.role === UserRole.ADMIN || user.role === UserRole.COACH
                  ? undefined
                  : user.sub,
         },
         select: this.workoutSessionSelect,
      });

      // Si no existe lanza NotFoundException
      if (!workoutSession)
         throw new NotFoundException(
            `Workout session with id "${id}" not found`,
         );
      return this.toPublicWorkoutSession(workoutSession);
   }

   /**
    * Crea una nueva sesion de entrenamiento y devuelve la version publica del registro.
    *
    * @param createWorkoutSessionDto - Datos de creacion de la sesion de entrenamiento
    * @returns Sesion de entrenamiento creada
    */
   async create(createWorkoutSessionDto: CreateWorkoutSessionDto) {
      try {
         const workoutSession = await this.prisma.workoutSession.create({
            data: this.toCreateData(createWorkoutSessionDto),
            select: this.workoutSessionSelect,
         });

         return this.toPublicWorkoutSession(workoutSession);
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
   async update(
      user: AuthenticatedUser,
      id: string,
      updateWorkoutSessionDto: UpdateWorkoutSessionDto,
   ) {
      // Verificamos si la sesion existe
      await this.getWorkoutSessionForUser(user, id);

      try {
         const workoutSession = await this.prisma.workoutSession.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutSessionDto),
            select: this.workoutSessionSelect,
         });

         return this.toPublicWorkoutSession(workoutSession);
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

      const workoutSession = await this.prisma.workoutSession.delete({
         where: { id },
         select: this.workoutSessionSelect,
      });

      return this.toPublicWorkoutSession(workoutSession);
   }

   /**
    * Completa una sesion de entrenamiento.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento completada
    * @throws NotFoundException si no existe
    */
   async completeSession(
      user: AuthenticatedUser,
      id: string,
      completeWorkoutSessionDto: CompleteWorkoutSessionDto = {},
   ) {
      // Obtenemos la sesion de entrenamiento.
      const existingSession = await this.getWorkoutSessionForUser(user, id);

      // Si ya se ha completado, lanza un error.
      if (existingSession.endedAt) {
         throw new ConflictException(
            `Workout session with id "${id}" is already completed`,
         );
      }

      // Consultamos si hay alguna serie completada.
      const completedSetsCount = await this.prisma.workoutSet.count({
         where: {
            workoutSessionId: id,
            isCompleted: true,
         },
      });

      // Si no hay ninguna serie completada, lanza un error.
      if (completedSetsCount === 0) {
         throw new ConflictException(
            `Workout session with id "${id}" has no completed sets`,
         );
      }

      // Completamos la sesion de entrenamiento.
      const session = await this.prisma.workoutSession.update({
         where: { id },
         data: {
            endedAt: new Date(),
            notes: completeWorkoutSessionDto.notes?.trim() || null,
         },
         select: this.workoutSessionSelect,
      });

      try {
         // En el canal de workouts, enviamos un mensaje de completado
         await this.workoutProducer.enqueueWorkoutCompleted(
            session.id,
            session.userId,
         );
      } catch (error) {
         // Capturamos cualquier error y lo reportamos
         this.logger.error(
            `Error encolando mensaje de completado de sesion de entrenamiento ${session.id}`,
            error instanceof Error ? error.stack : undefined,
         );
      }

      return this.toPublicWorkoutSession(session);
   }

   /**
    * Obtiene una listado de sesiones de entrenamiento completadas accesibles para el usuario autenticado.
    *
    * @param user - Usuario autenticado
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de sesiones por pagina
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de sesiones de entrenamiento completadas accesibles para el usuario autenticado
    */
   async findCompleted(
      user: AuthenticatedUser,
      page: number,
      limit: number,
      userId?: string,
   ): Promise<WorkoutSessionFeedListResponse> {
      const where: Prisma.WorkoutSessionWhereInput = {
         userId:
            user.role === UserRole.USER
               ? user.sub
               : userId
                 ? userId
                 : undefined,
         endedAt: { not: null },
      };

      const [sessions, total] = await Promise.all([
         this.prisma.workoutSession.findMany({
            select: completedWorkoutSessionFeedSelect,
            where,
            skip: page * limit,
            take: limit,
            orderBy: { endedAt: 'desc' },
         }),
         this.prisma.workoutSession.count({ where }),
      ]);

      return {
         items: sessions.map((session) => toWorkoutSessionFeedItem(session)),
         total,
         page,
         limit,
      };
   }

   /**
    * Obtiene el detalle de una sesion completada accesible para el usuario autenticado.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion completada
    * @returns Detalle de sesion completada con todos sus ejercicios agrupados
    */
   async findCompletedOne(
      user: AuthenticatedUser,
      id: string,
   ): Promise<WorkoutSessionFeedItem> {
      // Obtenemos la sesion de entrenamiento. Si el rol es USER, filtramos también por el user id del usuario que realiza la consulta.
      const session = await this.prisma.workoutSession.findFirst({
         select: completedWorkoutSessionFeedSelect,
         where: {
            id,
            userId: user.role === UserRole.USER ? user.sub : undefined,
            endedAt: { not: null },
         },
      });

      // Si no existe lanza NotFoundException
      if (!session)
         throw new NotFoundException(
            `Completed workout session with id "${id}" not found`,
         );

      return toWorkoutSessionFeedItem(session, { exerciseLimit: Infinity });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createWorkoutSessionDto - Datos de creacion de la sesion de entrenamiento
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      createWorkoutSessionDto: CreateWorkoutSessionDto,
   ): Prisma.WorkoutSessionCreateInput {
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
   private toUpdateData(
      updateWorkoutSessionDto: UpdateWorkoutSessionDto,
   ): Prisma.WorkoutSessionUpdateInput {
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
    * Convierte un registro de Prisma al contrato publico serializable de la API.
    *
    * @param workoutSession - Registro de sesion obtenido de Prisma
    * @returns Sesion de entrenamiento lista para respuesta JSON
    */
   private toPublicWorkoutSession(
      workoutSession: SelectedWorkoutSessionRecord,
   ): WorkoutSession {
      // Obtenemos el número de series completadas.
      const completedSetsCount = workoutSession.sets.length;

      // Obtenemos el volumen total de las series completadas.
      const volumeKg = workoutSession.sets.reduce((total, set) => {
         if (set.reps === null || set.weightKg === null) return total;
         return total + set.reps * set.weightKg;
      }, 0);

      return {
         id: workoutSession.id,
         userId: workoutSession.userId,
         workoutPlanId: workoutSession.workoutPlanId,
         name: workoutSession.name,
         notes: workoutSession.notes,
         startedAt: workoutSession.startedAt.toISOString(),
         endedAt: workoutSession.endedAt?.toISOString() ?? null,
         completedSetsCount,
         volumeKg,
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
         where: {
            id,
            userId: user.role === UserRole.USER ? user.sub : undefined,
         },
         select: { id: true, userId: true, endedAt: true },
      });

      if (!workoutSession)
         throw new NotFoundException(
            `Workout session with id "${id}" not found`,
         );

      return workoutSession;
   }
}
