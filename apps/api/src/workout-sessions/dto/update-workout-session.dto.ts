import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWorkoutSessionDto } from './create-workout-session.dto';

/**
 * Datos permitidos para actualizar parcialmente una sesion de entrenamiento.
 */
export class UpdateWorkoutSessionDto extends PartialType(
   OmitType(CreateWorkoutSessionDto, ['userId', 'startedAt'] as const),
) {}
