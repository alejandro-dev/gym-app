import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWorkoutSetDto } from './create-workout-set.dto';

/**
 * Datos permitidos para actualizar parcialmente una serie de entrenamiento.
 */
export class UpdateWorkoutSetDto extends PartialType(
  OmitType(CreateWorkoutSetDto, ['workoutSessionId', 'exerciseId'] as const),
) {}
