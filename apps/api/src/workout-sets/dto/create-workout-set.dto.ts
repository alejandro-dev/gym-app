import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Datos necesarios para crear una serie dentro de una sesion de entrenamiento.
 */
export class CreateWorkoutSetDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador de la sesion asociada. */
  @IsString()
  workoutSessionId!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
  /** Identificador del ejercicio asociado. */
  @IsString()
  exerciseId!: string;

  @ApiProperty({ example: 1 })
  /** Numero de serie dentro del ejercicio. */
  @IsInt()
  setNumber!: number;

  @ApiPropertyOptional({ example: 10, nullable: true })
  /** Repeticiones completadas. */
  @IsOptional()
  @IsInt()
  reps?: number | null;

  @ApiPropertyOptional({ example: 80, nullable: true })
  /** Peso usado en kilogramos. */
  @IsOptional()
  @IsNumber()
  weightKg?: number | null;

  @ApiPropertyOptional({ example: 45, nullable: true })
  /** Duracion en segundos. */
  @IsOptional()
  @IsInt()
  durationSeconds?: number | null;

  @ApiPropertyOptional({ example: 400, nullable: true })
  /** Distancia recorrida en metros. */
  @IsOptional()
  @IsNumber()
  distanceMeters?: number | null;

  @ApiPropertyOptional({ example: 2, nullable: true })
  /** Repeticiones en reserva. */
  @IsOptional()
  @IsInt()
  rir?: number | null;

  @ApiPropertyOptional({ example: false, default: false })
  /** Indica si es una serie de calentamiento. */
  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  /** Indica si la serie se completo. */
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
