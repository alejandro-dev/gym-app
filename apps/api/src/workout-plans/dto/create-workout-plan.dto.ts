import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutPlanGoal, WorkoutPlanLevel } from '@prisma/client';
import {
   IsBoolean,
   IsEnum,
   IsInt,
   IsOptional,
   IsString,
   Min,
} from 'class-validator';

/**
 * Datos necesarios para crear un plan de entrenamiento.
 */
export class CreateWorkoutPlanDto {
   @ApiProperty({
      example: 'cm9j8u4p10000fkoq2m9is1r0',
      nullable: true,
   })
   /** Identificador del usuario propietario del plan. */
   @IsOptional()
   @IsString()
   userId?: string | null | undefined;

   @ApiProperty({ example: 'Push Pull Legs - Beginner' })
   /** Nombre del plan de entrenamiento. */
   @IsString()
   name!: string;

   @ApiPropertyOptional({
      example: 'Plan de 3 dias enfocado en hipertrofia general.',
      nullable: true,
   })
   /** Descripcion opcional del plan. */
   @IsOptional()
   @IsString()
   description?: string | null;

   @ApiPropertyOptional({ example: true, default: true })
   /** Indica si el plan esta activo. */
   @IsOptional()
   @IsBoolean()
   isActive?: boolean;

   // @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador del usuario que creo el plan. */
   /*@IsString()
   createdById!: string;*/

   @ApiPropertyOptional({
      enum: WorkoutPlanGoal,
      example: WorkoutPlanGoal.HYPERTROPHY,
      nullable: true,
   })
   /** Objetivo del plan de entrenamiento. */
   @IsOptional()
   @IsEnum(WorkoutPlanGoal)
   goal?: WorkoutPlanGoal | null;

   @ApiPropertyOptional({
      enum: WorkoutPlanLevel,
      example: WorkoutPlanLevel.BEGINNER,
      nullable: true,
   })
   /** Nivel recomendado del plan de entrenamiento. */
   @IsOptional()
   @IsEnum(WorkoutPlanLevel)
   level?: WorkoutPlanLevel | null;

   @ApiPropertyOptional({ example: 8, nullable: true })
   /** Duracion estimada del plan en semanas. */
   @IsOptional()
   @IsInt()
   @Min(1)
   durationWeeks?: number | null;
}
