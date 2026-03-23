import { Module } from '@nestjs/common';
import { WorkoutSetsService } from './workout-sets.service';
import { WorkoutSetsController } from './workout-sets.controller';

/**
 * Modulo de funcionalidad para el dominio de series de entrenamiento.
 */
@Module({
  providers: [WorkoutSetsService],
  controllers: [WorkoutSetsController]
})
export class WorkoutSetsModule {}
