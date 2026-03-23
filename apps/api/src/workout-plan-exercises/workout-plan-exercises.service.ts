import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanExerciseDto } from './dto/create-workout-plan-exercise.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { UpdateWorkoutPlanExerciseDto } from './dto/update-workout-plan-exercise.dto';

/**
 * Servicio base para operaciones del dominio de ejercicios en plan de trabajo.
 */
@Injectable()
export class WorkoutPlanExerciseService {
   /**
    * Crea una nueva instancia del servicio de ejercicios en plan de trabajo.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicación
    */
   constructor(private readonly prisma: PrismaService) {}

   /**
    * Selecciona los campos de un ejercicio en plan de trabajo para la consulta.
    */
   private readonly workoutPlanExerciseSelect = {
      id: true,
      workoutPlanId: true,
      exerciseId: true,
      order: true,
      targetSets: true,
      targetRepsMin: true,
      targetRepsMax: true,
      targetWeightKg: true,
      restSeconds: true,
      notes: true
   } satisfies Prisma.WorkoutPlanExerciseSelect;

   /**
    * Obtiene todos los ejercicios en planes de trabajo ordenados por plan de trabajo y orden.
    */
   async findAll() {
      return await this.prisma.workoutPlanExercise.findMany({
         select: this.workoutPlanExerciseSelect,
         orderBy: [
            { workoutPlanId: 'asc' },
            { order: 'asc' },
         ]
      })
   }

   /**
    * Obtiene un ejercicio en plan de trabajo por id.
    * Lanza `NotFoundException` si no existe.
    */
   async findOne(id: string) {
      const workoutPlanExercise =  await this.prisma.workoutPlanExercise.findUnique({
         where: { id },
         select: this.workoutPlanExerciseSelect
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlanExercise) throw new NotFoundException(`Workout plan exercise with id "${id}" not found`);
      return workoutPlanExercise;
   }

   /**
    * Añade un ejercicio en plan de trabajo y devuelve la version publica del registro.
    */
   async create(createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto) {
      try {
         return await this.prisma.workoutPlanExercise.create({
            data: this.toCreateData(createWorkoutPlanExerciseDto),
            select: this.workoutPlanExerciseSelect,
         });
         
      } catch (error) {
         handlePrismaError(error, 'workout plan exercise');
      }
   }

   /**
    * Actualiza un ejercicio en plan de trabajo existente.
    * Lanza `NotFoundException` si el ejercicio no existe.
    */
   async update(id: string, updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto) {
      // Verificamos si el ejercicio en el plan de trabajo existe
      await this.ensureWorkoutPlanExerciseExists(id);

      try {
         return await this.prisma.workoutPlanExercise.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutPlanExerciseDto),
            select: this.workoutPlanExerciseSelect,
         });

      } catch (error) {
         handlePrismaError(error, 'workout plan exercise');
      }
   }

   /**
    * Elimina un ejercicio en plan de trabajo existente y devuelve el registro eliminado.
    */
   async remove(id: string) {
      // Verificamos si el ejercicio en el plan de trabajo existe
      await this.ensureWorkoutPlanExerciseExists(id);

      return await this.prisma.workoutPlanExercise.delete({
         where: { id },
         select: this.workoutPlanExerciseSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    */
   private toCreateData(createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto): Prisma.WorkoutPlanExerciseCreateInput {
      return {
         workoutPlan: {
            connect: {
               id: createWorkoutPlanExerciseDto.workoutPlanId,
            },
         },
         exercise: {
            connect: {
               id: createWorkoutPlanExerciseDto.exerciseId,
            },
         },
         order: createWorkoutPlanExerciseDto.order,
         targetSets: createWorkoutPlanExerciseDto.targetSets,
         targetRepsMin: createWorkoutPlanExerciseDto.targetRepsMin,
         targetRepsMax: createWorkoutPlanExerciseDto.targetRepsMax,
         targetWeightKg: createWorkoutPlanExerciseDto.targetWeightKg,
         restSeconds: createWorkoutPlanExerciseDto.restSeconds,
         notes: createWorkoutPlanExerciseDto.notes,
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
    */
   private toUpdateData(updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto): Prisma.WorkoutPlanExerciseUpdateInput {
      return {
         order: updateWorkoutPlanExerciseDto.order,
         targetSets: updateWorkoutPlanExerciseDto.targetSets,
         targetRepsMin: updateWorkoutPlanExerciseDto.targetRepsMin,
         targetRepsMax: updateWorkoutPlanExerciseDto.targetRepsMax,
         targetWeightKg: updateWorkoutPlanExerciseDto.targetWeightKg,
         restSeconds: updateWorkoutPlanExerciseDto.restSeconds,
         notes: updateWorkoutPlanExerciseDto.notes,
      };
   }

   /**
    * Verifica si el ejercicio en el plan de trabajo existe antes de actualizar o eliminar.
    */
   private async ensureWorkoutPlanExerciseExists(id: string) {
      const workoutPlanExercise = await this.prisma.workoutPlanExercise.findUnique({
         where: { id },
         select: { id: true },
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlanExercise) throw new NotFoundException(`Workout plan exercise with id "${id}" not found`);
   }
}
