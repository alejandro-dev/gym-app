import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Servicio base para operaciones del dominio de series de entrenamiento.
 */
@Injectable()
export class WorkoutSetsService {
   /**
    * Crea una nueva instancia del servicio de series de entrenamiento.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicacion
    */
   constructor(private readonly prisma: PrismaService) {}

   /**
    * Selecciona los campos publicos de una serie de entrenamiento.
    */
   private readonly workoutSetSelect = {
      id: true,
      workoutSessionId: true,
      exerciseId: true,
      setNumber: true,
      reps: true,
      weightKg: true,
      durationSeconds: true,
      distanceMeters: true,
      rir: true,
      isWarmup: true,
      isCompleted: true,
      createdAt: true,
   } satisfies Prisma.WorkoutSetSelect;

   /**
    * Obtiene todas las series de entrenamiento ordenadas por sesion, ejercicio y numero de serie.
    * 
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de series accesibles para el usuario autenticado
    */
   async findAll(user: AuthenticatedUser, userId: string) {
      return await this.prisma.workoutSet.findMany({
         select: this.workoutSetSelect,
         where: user.role === UserRole.USER ? { workoutSession: { userId: user.sub } } : userId ? { workoutSession: { userId: userId } } : undefined,
         orderBy: [
            { workoutSessionId: 'asc' },
            { exerciseId: 'asc' },
            { setNumber: 'asc' },
         ],
      });
   }

   /**
    * Obtiene una serie de entrenamiento por id.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la serie
    * @returns Serie encontrada
    * @throws NotFoundException si no existe
    */
   async findOne(user: AuthenticatedUser, id: string) {
      const workoutSet = await this.prisma.workoutSet.findUnique({
         where: { id, workoutSession: { userId: user.role === UserRole.USER ? user.sub : undefined } },
         select: this.workoutSetSelect,
      });

      if (!workoutSet) {
         throw new NotFoundException(`Workout set with id "${id}" not found`);
      }

      return workoutSet;
   }

   /**
    * Crea una serie de entrenamiento y devuelve su version publica.
    *
    * @param createWorkoutSetDto - Datos de creacion
    * @returns Serie creada
    */
   async create(createWorkoutSetDto: CreateWorkoutSetDto) {
      try {
         return await this.prisma.workoutSet.create({
            data: this.toCreateData(createWorkoutSetDto),
            select: this.workoutSetSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'workout set');
      }
   }

   /**
    * Actualiza una serie de entrenamiento existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la serie
    * @param updateWorkoutSetDto - Datos de actualizacion parcial
    * @returns Serie actualizada
    * @throws NotFoundException si no existe
    */
   async update(user: AuthenticatedUser, id: string, updateWorkoutSetDto: UpdateWorkoutSetDto) {
      await this.ensureWorkoutSetExists(user, id);

      try {
         return await this.prisma.workoutSet.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutSetDto),
            select: this.workoutSetSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'workout set');
      }
   }

   /**
    * Elimina una serie de entrenamiento existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la serie
    * @returns Serie eliminada
    * @throws NotFoundException si no existe
    */
   async remove(user: AuthenticatedUser, id: string) {
      await this.ensureWorkoutSetExists(user, id);

      return await this.prisma.workoutSet.delete({
         where: { id },
         select: this.workoutSetSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createWorkoutSetDto - Datos de creacion
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      createWorkoutSetDto: CreateWorkoutSetDto,
   ): Prisma.WorkoutSetCreateInput {
      return {
         workoutSession: {
            connect: {
               id: createWorkoutSetDto.workoutSessionId,
            },
         },
         exercise: {
            connect: {
               id: createWorkoutSetDto.exerciseId,
            },
         },
         setNumber: createWorkoutSetDto.setNumber,
         reps: createWorkoutSetDto.reps,
         weightKg: createWorkoutSetDto.weightKg,
         durationSeconds: createWorkoutSetDto.durationSeconds,
         distanceMeters: createWorkoutSetDto.distanceMeters,
         rir: createWorkoutSetDto.rir,
         isWarmup: createWorkoutSetDto.isWarmup,
         isCompleted: createWorkoutSetDto.isCompleted,
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de Prisma.
    *
    * @param updateWorkoutSetDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(
      updateWorkoutSetDto: UpdateWorkoutSetDto,
   ): Prisma.WorkoutSetUpdateInput {
      return {
         setNumber: updateWorkoutSetDto.setNumber,
         reps: updateWorkoutSetDto.reps,
         weightKg: updateWorkoutSetDto.weightKg,
         durationSeconds: updateWorkoutSetDto.durationSeconds,
         distanceMeters: updateWorkoutSetDto.distanceMeters,
         rir: updateWorkoutSetDto.rir,
         isWarmup: updateWorkoutSetDto.isWarmup,
         isCompleted: updateWorkoutSetDto.isCompleted,
      };
   }

   /**
    * Verifica si la serie existe antes de actualizar o eliminar.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la serie
    * @returns Promesa resuelta cuando la serie existe y es accesible para el usuario
    * @throws NotFoundException si no existe
    */
   private async ensureWorkoutSetExists(user: AuthenticatedUser, id: string) {
      const workoutSet = await this.prisma.workoutSet.findUnique({
         where: { id, workoutSession: { userId: user.role === UserRole.USER ? user.sub : undefined } },
         select: { id: true },
      });

      if (!workoutSet) {
         throw new NotFoundException(`Workout set with id "${id}" not found`);
      }
   }
}
