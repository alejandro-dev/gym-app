import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Nombre del campo de la imagen en el formulario de subida
export const EXERCISE_IMAGE_FIELD = 'image';

// Directorio de subida de imágenes de ejercicios
export const EXERCISE_IMAGES_DIR = join(process.cwd(), 'uploads', 'exercises');

// Tamaño máximo de imagen de ejercicio
export const MAX_EXERCISE_IMAGE_SIZE = 5 * 1024 * 1024;

// Tipos de archivo de imagen admitidos
export const EXERCISE_IMAGE_MIME_TYPES = [
   'image/jpeg',
   'image/png',
   'image/webp',
   'image/gif',
] as const;

// Extensión por tipo de archivo de imagen
const extensionByMimeType: Record<
   (typeof EXERCISE_IMAGE_MIME_TYPES)[number],
   string
> = {
   'image/jpeg': '.jpg',
   'image/png': '.png',
   'image/webp': '.webp',
   'image/gif': '.gif',
};

// Opciones de Multer para subir imágenes de ejercicios
export const exerciseImageMulterOptions: MulterOptions = {
   // Comprobamos que el archivo sea de un tipo permitido
   fileFilter: (_req, file, callback) => {
      if (
         EXERCISE_IMAGE_MIME_TYPES.includes(
            file.mimetype as (typeof EXERCISE_IMAGE_MIME_TYPES)[number],
         )
      ) {
         callback(null, true);
         return;
      }

      // Si no es un tipo permitido lanza un error
      callback(
         new BadRequestException(
            'Solo se permiten imagenes JPG, PNG, WEBP o GIF.',
         ),
         false,
      );
   },
   // Guardamos la imagen en el directorio de subida de ejercicios
   storage: diskStorage({
      destination: (_req, _file, callback) => {
         // Crea el directorio de subida de imágenes de ejercicios si no existe
         mkdirSync(EXERCISE_IMAGES_DIR, { recursive: true });

         // Devuelve el directorio de subida de imágenes de ejercicios
         callback(null, EXERCISE_IMAGES_DIR);
      },
      filename: (req, file, callback) => {
         // Genera un nombre único para la imagen usando el ID del ejercicio y un UUID
         const rawExerciseId = req.params.id;
         const exerciseId = Array.isArray(rawExerciseId)
            ? rawExerciseId[0]
            : rawExerciseId;
         const extension =
            extensionByMimeType[
               file.mimetype as (typeof EXERCISE_IMAGE_MIME_TYPES)[number]
            ];

         // Devuelve el nombre completo del archivo con la extensión original y el ID del ejercicio
         callback(
            null,
            `exercise-${exerciseId ?? 'unknown'}-${randomUUID()}${extension}`,
         );
      },
   }),
   // Limita el tamaño del archivo a 5MB
   limits: {
      fileSize: MAX_EXERCISE_IMAGE_SIZE,
   },
};
