import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representacion publica de una serie de entrenamiento.
 */
export class WorkoutSetResponseDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
  /** Identificador unico de la serie. */
  id!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador de la sesion asociada. */
  workoutSessionId!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
  /** Identificador del ejercicio asociado. */
  exerciseId!: string;

  @ApiProperty({ example: 1 })
  /** Numero de serie dentro del ejercicio. */
  setNumber!: number;

  @ApiPropertyOptional({ example: 10, nullable: true })
  /** Repeticiones completadas. */
  reps!: number | null;

  @ApiPropertyOptional({ example: 80, nullable: true })
  /** Peso usado en kilogramos. */
  weightKg!: number | null;

  @ApiPropertyOptional({ example: 45, nullable: true })
  /** Duracion en segundos. */
  durationSeconds!: number | null;

  @ApiPropertyOptional({ example: 400, nullable: true })
  /** Distancia recorrida en metros. */
  distanceMeters!: number | null;

  @ApiPropertyOptional({ example: 2, nullable: true })
  /** Repeticiones en reserva. */
  rir!: number | null;

  @ApiProperty({ example: false })
  /** Indica si es una serie de calentamiento. */
  isWarmup!: boolean;

  @ApiProperty({ example: true })
  /** Indica si la serie se completo. */
  isCompleted!: boolean;

  @ApiProperty({ example: '2026-03-23T10:00:00.000Z' })
  /** Fecha de creacion de la serie en formato ISO. */
  createdAt!: Date;
}
