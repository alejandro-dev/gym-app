import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representacion publica de un ejercicio dentro de un plan de entrenamiento.
 */
export class WorkoutPlanExerciseResponseDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador unico del registro. */
   id!: string;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
   /** Identificador del plan de entrenamiento asociado. */
   workoutPlanId!: string;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1xyz' })
   /** Identificador del ejercicio asociado. */
   exerciseId!: string;

   @ApiProperty({ example: 1 })
   /** Posicion del ejercicio dentro del plan. */
   order!: number;

   @ApiPropertyOptional({ example: 4, nullable: true })
   /** Numero objetivo de series. */
   targetSets!: number | null;

   @ApiPropertyOptional({ example: 8, nullable: true })
   /** Rango minimo objetivo de repeticiones. */
   targetRepsMin!: number | null;

   @ApiPropertyOptional({ example: 12, nullable: true })
   /** Rango maximo objetivo de repeticiones. */
   targetRepsMax!: number | null;

   @ApiPropertyOptional({ example: 80, nullable: true })
   /** Peso objetivo en kilogramos. */
   targetWeightKg!: number | null;

   @ApiPropertyOptional({ example: 90, nullable: true })
   /** Descanso objetivo entre series en segundos. */
   restSeconds!: number | null;

   @ApiPropertyOptional({
      example: 'Mantener la tecnica estricta en todas las series.',
      nullable: true,
   })
   /** Notas opcionales para la ejecucion. */
   notes!: string | null;
}
