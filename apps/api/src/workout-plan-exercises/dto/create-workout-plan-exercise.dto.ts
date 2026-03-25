import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Datos necesarios para crear un ejercicio dentro de un plan de entrenamiento.
 */
export class CreateWorkoutPlanExerciseDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador del plan de entrenamiento asociado. */
  @IsString()
  workoutPlanId!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
  /** Identificador del ejercicio asociado. */
  @IsString()
  exerciseId!: string;

  @ApiProperty({ example: 1 })
  /** Posicion del ejercicio dentro del plan. */
  @IsInt()
  order!: number;

  @ApiPropertyOptional({ example: 4, nullable: true })
  /** Numero objetivo de series. */
  @IsOptional()
  @IsInt()
  targetSets?: number | null;

  @ApiPropertyOptional({ example: 8, nullable: true })
  /** Rango minimo objetivo de repeticiones. */
  @IsOptional()
  @IsInt()
  targetRepsMin?: number | null;

  @ApiPropertyOptional({ example: 12, nullable: true })
  /** Rango maximo objetivo de repeticiones. */
  @IsOptional()
  @IsInt()
  targetRepsMax?: number | null;

  @ApiPropertyOptional({ example: 80, nullable: true })
  /** Peso objetivo en kilogramos. */
  @IsOptional()
  @IsNumber()
  targetWeightKg?: number | null;

  @ApiPropertyOptional({ example: 90, nullable: true })
  /** Descanso objetivo entre series en segundos. */
  @IsOptional()
  @IsInt()
  restSeconds?: number | null;

  @ApiPropertyOptional({
    example: 'Mantener la tecnica estricta en todas las series.',
    nullable: true,
  })
  /** Notas opcionales para la ejecucion. */
  @IsOptional()
  @IsString()
  notes?: string | null;
}
