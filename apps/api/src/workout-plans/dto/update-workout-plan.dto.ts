import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWorkoutPlanDto } from './create-workout-plan.dto';

/**
 * Datos permitidos para actualizar parcialmente un plan de entrenamiento.
 */
export class UpdateWorkoutPlanDto extends PartialType(
   OmitType(CreateWorkoutPlanDto, ['userId'] as const),
) {}
