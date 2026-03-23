import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representacion publica de una sesion de entrenamiento.
 */
export class WorkoutSessionResponseDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador unico de la sesion. */
   id!: string;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
   /** Identificador del usuario propietario de la sesion. */
   userId!: string;

   @ApiPropertyOptional({
      example: 'cm9j8u4p10000fkoq2m9is1xyz',
      nullable: true,
   })
   /** Identificador del plan asociado, si existe. */
   workoutPlanId!: string | null;

   @ApiProperty({ example: 'Pierna pesada' })
   /** Nombre de la sesion de entrenamiento. */
   name!: string;

   @ApiPropertyOptional({
      example: 'Buenas sensaciones, subir 2.5 kg la proxima semana.',
      nullable: true,
   })
   /** Notas opcionales de la sesion. */
   notes!: string | null;

   @ApiProperty({ example: '2026-03-23T10:00:00.000Z' })
   /** Fecha de inicio de la sesion en formato ISO. */
   startedAt!: Date;

   @ApiPropertyOptional({
      example: '2026-03-23T11:15:00.000Z',
      nullable: true,
   })
   /** Fecha de finalizacion de la sesion en formato ISO. */
   endedAt!: Date | null;
}
