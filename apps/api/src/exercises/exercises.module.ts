import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

/**
 * Módulo de funcionalidad para el dominio de ejercicios.
 */
@Module({
	controllers: [ExercisesController],
	providers: [ExercisesService],
})
export class ExercisesModule {}
