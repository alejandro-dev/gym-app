import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWorkoutPlanExerciseDto } from './create-workout-plan-exercise.dto';

/**
 * Datos permitidos para actualizar parcialmente un ejercicio dentro de un plan de entrenamiento.
 */
export class UpdateWorkoutPlanExerciseDto extends PartialType(
   OmitType(CreateWorkoutPlanExerciseDto, ['workoutPlanId'] as const),
) {}
