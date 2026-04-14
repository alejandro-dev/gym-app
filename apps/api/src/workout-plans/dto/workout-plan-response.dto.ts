import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutPlanGoal, WorkoutPlanLevel } from '@prisma/client';
import { IsOptional } from 'class-validator';

/**
 * Representacion publica de un plan de entrenamiento en respuestas HTTP.
 */
export class WorkoutPlanResponseDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador unico del plan. */
   id!: string;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1abc' })
   /** Identificador del usuario propietario del plan. */
   @IsOptional()
   userId: string | null | undefined;

   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1def' })
   /** Identificador del usuario que creo el plan. */
   createdById!: string;

   @ApiProperty({ example: 'Push Pull Legs - Beginner' })
   /** Nombre del plan de entrenamiento. */
   name!: string;

   @ApiPropertyOptional({
      example: 'Plan de 3 dias enfocado en hipertrofia general.',
      nullable: true,
   })
   /** Descripcion opcional del plan. */
   description!: string | null;

   @ApiPropertyOptional({
      example: 'STRENGTH',
      enum: WorkoutPlanGoal,
      nullable: true,
   })
   /** Indica si el objetivo del plan. */
   goal!: WorkoutPlanGoal | null;

   @ApiPropertyOptional({
      example: 'ADVANCED',
      enum: WorkoutPlanLevel,
      nullable: true,
   })
   /** Indica el nivel del plan. */
   level!: WorkoutPlanLevel | null;

   @ApiPropertyOptional({
      example: 3,
      nullable: true,
   })
   /** Indica la duracion estimada del plan en semanas. */
   durationWeeks!: number | null;

   @ApiProperty({ example: true })
   /** Indica si el plan esta activo. */
   isActive!: boolean;

   @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
   /** Fecha de creacion del plan en formato ISO. */
   createdAt!: Date;

   @ApiProperty({ example: '2026-03-21T10:00:00.000Z' })
   /** Fecha de ultima actualizacion del plan en formato ISO. */
   updatedAt!: Date;

   @ApiProperty({
      example: {
         email: 'alex@gym.local',
         firstName: 'Alex',
         lastName: 'Garcia',
      },
   })
   /** Usuario propietario del plan. */
   user!: {
      email: string;
      firstName: string | null;
      lastName: string | null;
   };
}
