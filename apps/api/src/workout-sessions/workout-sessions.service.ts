import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';

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
   constructor(private readonly prisma: PrismaService) {}

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
    */
   async findAll() {
      return await this.prisma.workoutSession.findMany({
         select: this.workoutSessionSelect,
         orderBy: {
            createdAt: 'desc',
         },
      });
   }

   /**
    * Obtiene una sesion de entrenamiento por id.
    * Lanza `NotFoundException` si no existe.
    */
   async findOne(id: string) {
      const workoutSession = await this.prisma.workoutSession.findUnique({
         where: { id },
         select: this.workoutSessionSelect,
      });

      // Si no existe lanza NotFoundException
      if (!workoutSession) throw new NotFoundException(`Workout session with id "${id}" not found`);
      return workoutSession;
   }

   /**
    * Crea una nueva sesion de entrenamiento y devuelve la version publica del registro.
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
    * Lanza `NotFoundException` si la sesion no existe.
    */
   async update(id: string, updateWorkoutSessionDto: UpdateWorkoutSessionDto) {
      // Verificamos si la sesion existe
      await this.ensureWorkoutSessionExists(id);

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
    */
   async remove(id: string) {
      // Verificamos si la sesion existe
      await this.ensureWorkoutSessionExists(id);

      return await this.prisma.workoutSession.delete({
         where: { id },
         select: this.workoutSessionSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
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
    * Verifica si la sesion de entrenamiento existe antes de actualizar o eliminar.
    */
   private async ensureWorkoutSessionExists(id: string) {
      const workoutSession = await this.prisma.workoutSession.findUnique({
         where: { id },
         select: { id: true },
      });

      // Si no existe lanza NotFoundException
      if (!workoutSession) throw new NotFoundException(`Workout session with id "${id}" not found`);
   }
}
