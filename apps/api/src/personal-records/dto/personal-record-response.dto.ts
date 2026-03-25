import { ApiProperty } from '@nestjs/swagger';
import { PersonalRecordMetric } from '@prisma/client';

/**
 * Representacion publica de un record personal.
 */
export class PersonalRecordResponseDto {
  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
  /** Identificador unico del record. */
  id!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
  /** Identificador del usuario propietario del record. */
  userId!: string;

  @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
  /** Identificador del ejercicio asociado. */
  exerciseId!: string;

  @ApiProperty({
    enum: PersonalRecordMetric,
    example: PersonalRecordMetric.ESTIMATED_1RM,
  })
  /** Metrica registrada. */
  metric!: PersonalRecordMetric;

  @ApiProperty({ example: 120 })
  /** Valor numerico del record. */
  value!: number;

  @ApiProperty({ example: '2026-03-23T10:00:00.000Z' })
  /** Fecha en la que se logro el record. */
  achievedAt!: Date;

  @ApiProperty({ example: '2026-03-23T10:05:00.000Z' })
  /** Fecha de creacion del record. */
  createdAt!: Date;
}
