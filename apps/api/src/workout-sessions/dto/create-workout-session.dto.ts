import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Datos necesarios para crear una sesion de entrenamiento.
 */
export class CreateWorkoutSessionDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador del usuario propietario de la sesion. */
  @IsString()
  userId!: string;

  @ApiPropertyOptional({
    example: 'cm9j8u4p10000fkoq2m9is1xyz',
    nullable: true,
  })
  /** Identificador opcional del plan asociado. */
  @IsOptional()
  @IsString()
  workoutPlanId?: string | null;

  @ApiProperty({ example: 'Pierna pesada' })
  /** Nombre de la sesion de entrenamiento. */
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Buenas sensaciones, subir 2.5 kg la proxima semana.',
    nullable: true,
  })
  /** Notas opcionales de la sesion. */
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty({ example: '2026-03-23T10:00:00.000Z' })
  /** Fecha de inicio de la sesion en formato ISO. */
  @IsDateString()
  startedAt!: string;

  @ApiPropertyOptional({
    example: '2026-03-23T11:15:00.000Z',
    nullable: true,
  })
  /** Fecha de finalizacion de la sesion en formato ISO. */
  @IsOptional()
  @IsDateString()
  endedAt?: string | null;
}
