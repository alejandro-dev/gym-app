import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseCategory, MuscleGroup } from '@prisma/client';

/**
 * Representacion publica de un ejercicio en respuestas HTTP.
 */
export class ExerciseResponseDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
  /** Identificador unico del ejercicio. */
  id!: string;

  @ApiProperty({ example: 'Barbell Back Squat' })
  /** Nombre unico del ejercicio. */
  name!: string;

  @ApiProperty({ example: 'barbell-back-squat' })
  /** Slug unico del ejercicio. */
  slug!: string;

  @ApiPropertyOptional({
    example: 'Classic lower-body strength exercise.',
    nullable: true,
  })
  /** Descripcion opcional del ejercicio. */
  description!: string | null;

  @ApiPropertyOptional({
    example: 'Brace, descend below parallel, and drive up.',
    nullable: true,
  })
  /** Instrucciones opcionales de ejecucion. */
  instructions!: string | null;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.LEGS })
  /** Grupo muscular principal del ejercicio. */
  muscleGroup!: MuscleGroup;

  @ApiProperty({ enum: ExerciseCategory, example: ExerciseCategory.STRENGTH })
  /** Categoria funcional del ejercicio para calculo de records personales. */
  category!: ExerciseCategory;

  @ApiPropertyOptional({ example: 'Barbell', nullable: true })
  /** Material principal del ejercicio. */
  equipment!: string | null;

  @ApiProperty({ example: true })
  /** Indica si el ejercicio es multiarticular. */
  isCompound!: boolean;

  @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
  /** Fecha de creacion del ejercicio en formato ISO. */
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
  /** Fecha de ultima actualizacion del ejercicio en formato ISO. */
  updatedAt!: Date;
}
