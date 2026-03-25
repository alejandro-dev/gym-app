import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanExerciseDto } from './dto/create-workout-plan-exercise.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { UpdateWorkoutPlanExerciseDto } from './dto/update-workout-plan-exercise.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

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
    notes: true,
  } satisfies Prisma.WorkoutPlanExerciseSelect;

  /**
   * Obtiene todos los ejercicios en planes de trabajo ordenados por plan de trabajo y orden.
   *
   * @param user - Usuario autenticado
   * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
   * @returns Listado de ejercicios de plan accesibles para el usuario autenticado
   */
  async findAll(user: AuthenticatedUser, userId?: string) {
    return await this.prisma.workoutPlanExercise.findMany({
      select: this.workoutPlanExerciseSelect,
      where:
        user.role === UserRole.USER
          ? { workoutPlan: { userId: user.sub } }
          : userId
            ? { workoutPlan: { userId: userId } }
            : undefined,
      orderBy: [{ workoutPlanId: 'asc' }, { order: 'asc' }],
    });
  }

  /**
   * Obtiene un ejercicio en plan de trabajo por id.
   *
   * @param user - Usuario autenticado
   * @param id - Identificador del ejercicio en plan de trabajo
   * @returns Ejercicio en plan de trabajo encontrado
   * @throws NotFoundException si no existe
   */
  async findOne(user: AuthenticatedUser, id: string) {
    const workoutPlanExercise =
      await this.prisma.workoutPlanExercise.findUnique({
        where: {
          id,
          workoutPlan: {
            userId: user.role === UserRole.USER ? user.sub : undefined,
          },
        },
        select: this.workoutPlanExerciseSelect,
      });

    // Si no existe lanza NotFoundException
    if (!workoutPlanExercise)
      throw new NotFoundException(
        `Workout plan exercise with id "${id}" not found`,
      );
    return workoutPlanExercise;
  }

  /**
   * Añade un ejercicio en plan de trabajo y devuelve la version publica del registro.
   *
   * @param createWorkoutPlanExerciseDto - Datos de creacion
   * @returns Ejercicio en plan de trabajo creado
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
   *
   * @param user - Usuario autenticado
   * @param id - Identificador del ejercicio en plan de trabajo
   * @param updateWorkoutPlanExerciseDto - Datos de actualizacion parcial
   * @returns Ejercicio en plan de trabajo actualizado
   * @throws NotFoundException si el ejercicio no existe
   */
  async update(
    user: AuthenticatedUser,
    id: string,
    updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto,
  ) {
    // Verificamos si el ejercicio en el plan de trabajo existe
    await this.ensureWorkoutPlanExerciseExists(user, id);

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
   *
   * @param user - Usuario autenticado
   * @param id - Identificador del ejercicio en plan de trabajo
   * @returns Ejercicio en plan de trabajo eliminado
   * @throws NotFoundException si no existe
   */
  async remove(user: AuthenticatedUser, id: string) {
    // Verificamos si el ejercicio en el plan de trabajo existe
    await this.ensureWorkoutPlanExerciseExists(user, id);

    return await this.prisma.workoutPlanExercise.delete({
      where: { id },
      select: this.workoutPlanExerciseSelect,
    });
  }

  /**
   * Convierte el DTO de creacion al formato esperado por Prisma.
   *
   * @param createWorkoutPlanExerciseDto - Datos de creacion
   * @returns Datos adaptados a Prisma para crear un ejercicio en plan de trabajo
   */
  private toCreateData(
    createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto,
  ): Prisma.WorkoutPlanExerciseCreateInput {
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
   *
   * @param updateWorkoutPlanExerciseDto - Datos de actualizacion parcial
   * @returns Datos adaptados a Prisma para actualizar un ejercicio en plan de trabajo
   */
  private toUpdateData(
    updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto,
  ): Prisma.WorkoutPlanExerciseUpdateInput {
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
   *
   * @param user - Usuario autenticado
   * @param id - Identificador del ejercicio en plan de trabajo
   * @returns Promesa resuelta cuando el ejercicio existe y es accesible para el usuario
   * @throws NotFoundException si no existe
   */
  private async ensureWorkoutPlanExerciseExists(
    user: AuthenticatedUser,
    id: string,
  ) {
    const workoutPlanExercise =
      await this.prisma.workoutPlanExercise.findUnique({
        where: {
          id,
          workoutPlan: {
            userId: user.role === UserRole.USER ? user.sub : undefined,
          },
        },
        select: { id: true, workoutPlan: true },
      });

    // Si no existe lanza NotFoundException
    if (!workoutPlanExercise)
      throw new NotFoundException(
        `Workout plan exercise with id "${id}" not found`,
      );
  }
}
