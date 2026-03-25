import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';

/**
 * Servicio base para operaciones del dominio de ejercicios.
 */
@Injectable()
export class ExercisesService {
  /**
   * Crea una nueva instancia del servicio de ejercicios.
   *
   * @param prisma - Cliente de Prisma compartido por la aplicación
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Selecciona los campos de un ejercicio para la consulta.
   */
  private readonly exerciseSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    instructions: true,
    muscleGroup: true,
    category: true,
    equipment: true,
    isCompound: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.ExerciseSelect;

  /**
   * Obtiene todos los ejercicios ordenados por fecha de creacion descendente.
   *
   * @returns Listado de ejercicios
   */
  async findAll() {
    return this.prisma.exercise.findMany({
      select: this.exerciseSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene un ejercicio por id.
   *
   * @param id - Identificador del ejercicio
   * @returns Ejercicio encontrado
   * @throws NotFoundException si no existe
   */
  async findOne(id: string) {
    // Consulta de un ejercicio por id
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      select: this.exerciseSelect,
    });

    // Si no existe lanza NotFoundException
    if (!exercise)
      throw new NotFoundException(`Exercise with id "${id}" not found`);

    return exercise;
  }

  /**
   * Crea un ejercicio y devuelve la version publica del registro.
   *
   * @param createExerciseDto - Datos de creacion del ejercicio
   * @returns Ejercicio creado
   */
  async create(createExerciseDto: CreateExerciseDto) {
    try {
      return await this.prisma.exercise.create({
        data: this.toCreateData(createExerciseDto),
        select: this.exerciseSelect,
      });
    } catch (error) {
      handlePrismaError(error, 'exercise');
    }
  }

  /**
   * Actualiza un ejercicio existente.
   *
   * @param id - Identificador del ejercicio
   * @param updateExerciseDto - Datos de actualizacion parcial
   * @returns Ejercicio actualizado
   * @throws NotFoundException si el ejercicio no existe
   */
  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    // Verifica si el ejercicio existe
    await this.ensureExerciseExists(id);

    try {
      return await this.prisma.exercise.update({
        where: { id },
        data: this.toUpdateData(updateExerciseDto),
        select: this.exerciseSelect,
      });
    } catch (error) {
      handlePrismaError(error, 'exercise');
    }
  }

  /**
   * Elimina un ejercicio existente y devuelve el registro eliminado.
   *
   * @param id - Identificador del ejercicio
   * @returns Ejercicio eliminado
   * @throws NotFoundException si no existe
   */
  async remove(id: string) {
    // Verifica si el ejercicio existe
    await this.ensureExerciseExists(id);

    return await this.prisma.exercise.delete({
      where: { id },
      select: this.exerciseSelect,
    });
  }

  /**
   * Convierte el DTO de creacion al formato esperado por Prisma.
   *
   * @param createExerciseDto - Datos de creacion del ejercicio
   * @returns Datos adaptados a Prisma
   */
  private toCreateData(
    createExerciseDto: CreateExerciseDto,
  ): Prisma.ExerciseCreateInput {
    return {
      name: createExerciseDto.name,
      slug: createExerciseDto.slug,
      description: createExerciseDto.description,
      instructions: createExerciseDto.instructions,
      muscleGroup: createExerciseDto.muscleGroup,
      category: createExerciseDto.category,
      equipment: createExerciseDto.equipment,
      isCompound: createExerciseDto.isCompound ?? false,
    };
  }

  /**
   * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
   *
   * @param updateExerciseDto - Datos de actualizacion parcial
   * @returns Datos adaptados a Prisma
   */
  private toUpdateData(
    updateExerciseDto: UpdateExerciseDto,
  ): Prisma.ExerciseUpdateInput {
    return {
      name: updateExerciseDto.name,
      slug: updateExerciseDto.slug,
      description: updateExerciseDto.description,
      instructions: updateExerciseDto.instructions,
      muscleGroup: updateExerciseDto.muscleGroup,
      category: updateExerciseDto.category,
      equipment: updateExerciseDto.equipment,
      isCompound: updateExerciseDto.isCompound,
    };
  }

  /**
   * Verifica si el ejercicio existe antes de actualizar o eliminar.
   *
   * @param id - Identificador del ejercicio
   * @returns Promesa resuelta cuando el ejercicio existe
   * @throws NotFoundException si no existe
   */
  private async ensureExerciseExists(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      select: { id: true },
    });

    // Si no existe lanza NotFoundException
    if (!exercise)
      throw new NotFoundException(`Exercise with id "${id}" not found`);
  }
}
