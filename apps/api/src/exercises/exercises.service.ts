import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseCategory, MuscleGroup, Prisma } from '@prisma/client';
import { unlink } from 'node:fs/promises';
import { join, normalize, relative } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { EXERCISE_IMAGES_DIR } from './upload/exercise-image-multer.options';
import type { Exercise } from '@gym-app/types';

// Directorio de subida de imágenes de ejercicios
const EXERCISE_IMAGES_PUBLIC_PREFIX = '/uploads/exercises/';

type SelectedExerciseRecord = {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   instructions: string | null;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
   imageUrl: string | null;
   videoUrl: string | null;
   createdAt: Date;
   updatedAt: Date;
};

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
      imageUrl: true,
      videoUrl: true,
      createdAt: true,
      updatedAt: true,
   } satisfies Prisma.ExerciseSelect;

   /**
    * Obtiene todos los ejercicios ordenados por fecha de creacion descendente.
    *
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de ejercicios por pagina
    * @param search - Cadena de búsqueda para filtrar ejercicios
    *
    * @returns Listado de ejercicios
    */
   async findAll(
      page: number,
      limit: number,
      search: string,
      groupMuscleFilter: MuscleGroup,
      exerciseCategoryFilter: ExerciseCategory,
   ) {
      try {
         // Si hay una cadena de búsqueda, filtramos los usuarios por nombre.
         /*const where: Prisma.ExerciseWhereInput | undefined = search
            ? {
               // mode: 'insensitive',ignora mayúsculas/minúsculas
               OR: [{ name: { contains: search, mode: 'insensitive' } }]
            } : undefined;*/

         const where: Prisma.ExerciseWhereInput = {
            ...(search?.trim() && {
               name: {
                  contains: search.trim(),
                  mode: 'insensitive',
               },
            }),
            ...(groupMuscleFilter && {
               muscleGroup: groupMuscleFilter,
            }),
            ...(exerciseCategoryFilter && {
               category: exerciseCategoryFilter,
            }),
         };

         const [exercises, total] = await Promise.all([
            this.prisma.exercise.findMany({
               select: this.exerciseSelect,
               where,
               orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
               skip: page * limit,
               take: limit,
            }),
            this.prisma.exercise.count({
               where,
            }),
         ]);

         return {
            items: exercises.map((exercise) => this.toPublicUser(exercise)),
            total,
            page,
            limit,
         };
      } catch (error) {
         handlePrismaError(error, 'exercise');
      }
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
      const exercise = await this.findExistingExerciseImage(id);

      // Eliminamos el ejercicio en la base de datos
      const deletedExercise = await this.prisma.exercise.delete({
         where: { id },
         select: this.exerciseSelect,
      });

      // Eliminamos la imágen del ejercicio
      await this.deleteLocalExerciseImage(exercise.imageUrl);

      return deletedExercise;
   }

   /**
    * Actualiza la imagen publica asociada a un ejercicio.
    *
    * @param id - Identificador del ejercicio
    * @param imageUrl - URL publica de la imagen subida
    * @returns Ejercicio actualizado
    * @throws NotFoundException si el ejercicio no existe
    */
   async updateImage(id: string, imageUrl: string) {
      // Verifica si el ejercicio existe
      const exercise = await this.findExistingExerciseImage(id);

      // Actualizamos la imagen en la base de datos
      const updatedExercise = await this.prisma.exercise.update({
         where: { id },
         data: { imageUrl },
         select: this.exerciseSelect,
      });

      // Eliminamos la imagen antigua
      await this.deleteLocalExerciseImage(exercise.imageUrl);

      return updatedExercise;
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
         videoUrl: createExerciseDto.videoUrl,
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
         videoUrl: updateExerciseDto.videoUrl,
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

   /**
    * Convierte un registro de Prisma al contrato publico serializable de la API.
    *
    * @param exercise - Ejercicio seleccionado desde Prisma
    * @returns Ejercicio listo para respuesta JSON
    */
   private toPublicUser(exercise: SelectedExerciseRecord): Exercise {
      return {
         ...exercise,
         createdAt: exercise.createdAt.toISOString(),
         updatedAt: exercise.updatedAt.toISOString(),
      };
   }

   /**
    * Convierte la URL de una imagen de ejercicio en una ruta de archivo local.
    *
    * @param imageUrl - URL de la imagen de ejercicio
    * @returns Ruta de archivo de la imagen de ejercicio
    */
   private resolveLocalExerciseImagePath(imageUrl: string | null) {
      // Si la imagen no es de ejercicio, no se debe eliminar
      if (!imageUrl?.startsWith(EXERCISE_IMAGES_PUBLIC_PREFIX)) {
         return null;
      }

      // Eliminamos el prefijo de la URL de la imagen para obtener la ruta relativa dentro del directorio de imágenes de ejercicios
      const filename = imageUrl.slice(EXERCISE_IMAGES_PUBLIC_PREFIX.length);

      // Normalizamos la ruta relativa para evitar errores de ruta relativa y unimos con el directorio base de imágenes de ejercicios para obtener la ruta absoluta
      const resolvedPath = normalize(join(EXERCISE_IMAGES_DIR, filename));
      const relativePath = relative(EXERCISE_IMAGES_DIR, resolvedPath);

      // Si la ruta relativa es relativa o es una ruta de archivo vacía, no se debe eliminar
      if (relativePath.startsWith('..') || relativePath === '') {
         return null;
      }

      return resolvedPath;
   }

   /**
    * Elimina la imagen de ejercicio si existe.
    *
    * @param imageUrl - URL de la imagen de ejercicio
    * @returns Promesa resuelta cuando la imagen se elimina
    */
   private async deleteLocalExerciseImage(imageUrl: string | null) {
      // Consultamos la ruta de archivo de la imagen de ejercicio
      const imagePath = this.resolveLocalExerciseImagePath(imageUrl);

      // Si la ruta de archivo no existe, no se debe eliminar
      if (!imagePath) {
         return;
      }

      // Eliminamos la imagen de ejercicio local
      await unlink(imagePath).catch(() => undefined);
   }

   /**
    * Verifica que el ejercicio existe antes de actualizar o eliminar.
    *
    * @param id - Identificador del ejercicio
    * @returns Promesa resuelta cuando el ejercicio existe
    * @throws NotFoundException si no existe
    */
   private async findExistingExerciseImage(id: string) {
      const exercise = await this.prisma.exercise.findUnique({
         where: { id },
         select: {
            id: true,
            imageUrl: true,
         },
      });

      if (!exercise) {
         throw new NotFoundException(`Exercise with id "${id}" not found`);
      }

      return exercise;
   }
}
