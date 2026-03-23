import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

/**
 * Datos necesarios para crear un record personal.
 */
export class CreatePersonalRecordDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
   /** Identificador del usuario propietario del record. */
   @IsString()
   userId!: string;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
   /** Identificador del ejercicio asociado. */
   @IsString()
   exerciseId!: string;

   @ApiProperty({ example: 'estimated-1rm' })
   /** Metrica registrada. */
   @IsString()
   metric!: string;

   @ApiProperty({ example: 120 })
   /** Valor numerico del record. */
   @IsNumber()
   value!: number;

   @ApiProperty({ example: '2026-03-23T10:00:00.000Z' })
   /** Fecha en la que se logro el record. */
   @IsDateString()
   achievedAt!: string;
}
