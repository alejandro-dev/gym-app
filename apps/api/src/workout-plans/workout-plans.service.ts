import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Servicio base para operaciones del dominio de planes de trabajo.
 */
@Injectable()
export class WorkoutPlansService {
   /**
    * Crea una nueva instancia del servicio de planes de trabajo.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicación
    */
   constructor(private readonly prisma: PrismaService) {}

   /**
    * Selecciona los campos de un plan de trabajo para la consulta.
    */
   private readonly workoutPlanSelect = {
      id: true,
      userId: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
   } satisfies Prisma.WorkoutPlanSelect;

   /**
    * Obtiene todos los planes de trabajo ordenados por fecha de creacion descendente.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de planes de trabajo accesibles para el usuario autenticado
    */
   async findAll(user: AuthenticatedUser, userId?: string) {
      return await this.prisma.workoutPlan.findMany({
         select: this.workoutPlanSelect,
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
   }

   /**
    * Obtiene un plan de trabajo por id.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Plan de trabajo encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(user: AuthenticatedUser, id: string) {
      const workoutPlan = await this.prisma.workoutPlan.findUnique({
         where: {
            id,
            userId:
               user.role === UserRole.ADMIN || user.role === UserRole.COACH
                  ? undefined
                  : user.sub,
         },
         select: this.workoutPlanSelect,
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan)
         throw new NotFoundException(`Workout plan with id "${id}" not found`);
      return workoutPlan;
   }

   /**
    * Crea un plan de trabajo y devuelve la version publica del registro.
    *
    * @param createWorkoutPlanDto - Datos de creacion del plan de trabajo
    * @returns Plan de trabajo creado
    */
   async create(createWorkoutPlanDto: CreateWorkoutPlanDto) {
      try {
         return await this.prisma.workoutPlan.create({
            data: this.toCreateData(createWorkoutPlanDto),
            select: this.workoutPlanSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'workout plan');
      }
   }

   /**
    * Actualiza un plan de trabajo existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @param updateWorkoutPlanDto - Datos de actualizacion parcial
    * @returns Plan de trabajo actualizado
    * @throws NotFoundException si el plan de trabajo no existe
    */
   async update(
      user: AuthenticatedUser,
      id: string,
      updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(user, id);

      try {
         return await this.prisma.workoutPlan.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutPlanDto),
            select: this.workoutPlanSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'workout plan');
      }
   }

   /**
    * Elimina un plan de trabajo existente y devuelve el registro eliminado.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Plan de trabajo eliminado
    * @throws NotFoundException si no existe
    */
   async remove(user: AuthenticatedUser, id: string) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(user, id);

      return await this.prisma.workoutPlan.delete({
         where: { id },
         select: this.workoutPlanSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createWorkoutPlanDto - Datos de creacion del plan de trabajo
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      createWorkoutPlanDto: CreateWorkoutPlanDto,
   ): Prisma.WorkoutPlanCreateInput {
      return {
         name: createWorkoutPlanDto.name,
         description: createWorkoutPlanDto.description,
         isActive: createWorkoutPlanDto.isActive,
         user: {
            connect: {
               id: createWorkoutPlanDto.userId,
            },
         },
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
    *
    * @param updateWorkoutPlanDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(
      updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ): Prisma.WorkoutPlanUpdateInput {
      return {
         name: updateWorkoutPlanDto.name,
         description: updateWorkoutPlanDto.description,
         isActive: updateWorkoutPlanDto.isActive,
      };
   }

   /**
    * Verifica si el plan de trabajo existe antes de actualizar o eliminar.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Promesa resuelta cuando el plan existe y es accesible para el usuario
    * @throws NotFoundException si no existe
    */
   private async ensureWorkoutPlanExists(user: AuthenticatedUser, id: string) {
      const workoutPlan = await this.prisma.workoutPlan.findUnique({
         where: {
            id,
            userId:
               user.role === UserRole.ADMIN || user.role === UserRole.COACH
                  ? undefined
                  : user.sub,
         },
         select: { id: true, userId: true },
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan)
         throw new NotFoundException(`Workout plan with id "${id}" not found`);
   }
}
