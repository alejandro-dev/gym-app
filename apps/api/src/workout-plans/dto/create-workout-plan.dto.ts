import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Datos necesarios para crear un plan de entrenamiento.
 */
export class CreateWorkoutPlanDto {
	@ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
	/** Identificador del usuario propietario del plan. */
	@IsString()
	userId!: string;

	@ApiProperty({ example: 'Push Pull Legs - Beginner' })
	/** Nombre del plan de entrenamiento. */
	@IsString()
	name!: string;

	@ApiPropertyOptional({
		example: 'Plan de 3 dias enfocado en hipertrofia general.',
		nullable: true,
	})
	/** Descripcion opcional del plan. */
	@IsOptional()
	@IsString()
	description?: string | null;

	@ApiPropertyOptional({ example: true, default: true })
	/** Indica si el plan esta activo. */
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
