import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representacion publica de un plan de entrenamiento en respuestas HTTP.
 */
export class WorkoutPlanResponseDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
  /** Identificador unico del plan. */
  id!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador del usuario propietario del plan. */
  userId!: string;

  @ApiProperty({ example: 'Push Pull Legs - Beginner' })
  /** Nombre del plan de entrenamiento. */
  name!: string;

  @ApiPropertyOptional({
    example: 'Plan de 3 dias enfocado en hipertrofia general.',
    nullable: true,
  })
  /** Descripcion opcional del plan. */
  description!: string | null;

  @ApiProperty({ example: true })
  /** Indica si el plan esta activo. */
  isActive!: boolean;

  @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
  /** Fecha de creacion del plan en formato ISO. */
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
  /** Fecha de ultima actualizacion del plan en formato ISO. */
  updatedAt!: Date;
}
