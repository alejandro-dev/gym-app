import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';

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
    */
   async findAll() {
      return await this.prisma.workoutPlan.findMany({
         select: this.workoutPlanSelect,
         orderBy: {
            createdAt: 'desc'
         }
      })
   }

   /**
    * Obtiene un plan de trabajo por id.
    * Lanza `NotFoundException` si no existe.
    */
   async findOne(id: string) {
      const workoutPlan =  await this.prisma.workoutPlan.findUnique({
         where: { id },
         select: this.workoutPlanSelect
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan) throw new NotFoundException(`Workout plan with id "${id}" not found`);
      return workoutPlan;
   }

   /**
    * Crea un plan de trabajo y devuelve la version publica del registro.
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

   async update(id: string, updateWorkoutPlanDto: UpdateWorkoutPlanDto) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(id);

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
    */
   async remove(id: string) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(id);

      return await this.prisma.workoutPlan.delete({
         where: { id },
         select: this.workoutPlanSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    */
   private toCreateData(createWorkoutPlanDto: CreateWorkoutPlanDto): Prisma.WorkoutPlanCreateInput {
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
    */
   private toUpdateData(updateWorkoutPlanDto: UpdateWorkoutPlanDto): Prisma.WorkoutPlanUpdateInput {
      return {
         name: updateWorkoutPlanDto.name,
         description: updateWorkoutPlanDto.description,
         isActive: updateWorkoutPlanDto.isActive
      };
   }

   private async ensureWorkoutPlanExists(id: string) {
      const workoutPlan = await this.prisma.workoutPlan.findUnique({
         where: { id },
         select: { id: true },
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan) throw new NotFoundException(`Workout plan with id "${id}" not found`);
   }
}
