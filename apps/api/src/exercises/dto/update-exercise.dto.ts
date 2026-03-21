import { PartialType } from '@nestjs/swagger';
import { CreateExerciseDto } from './create-exercise.dto';

/**
 * Datos permitidos para actualizar parcialmente un ejercicio.
 */
export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
