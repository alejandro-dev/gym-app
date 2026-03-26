import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseCategory, MuscleGroup } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Datos necesarios para crear un ejercicio.
 * Refleja los campos disponibles en el modelo `Exercise` de Prisma.
 */
export class CreateExerciseDto {
   @ApiProperty({ example: 'Barbell Back Squat' })
   /** Nombre unico del ejercicio. */
   @IsString()
   name!: string;

   @ApiProperty({ example: 'barbell-back-squat' })
   /** Slug unico del ejercicio para referencias estables. */
   @IsString()
   slug!: string;

   @ApiPropertyOptional({
      example: 'Classic lower-body strength exercise.',
      nullable: true,
   })
   /** Descripcion opcional del ejercicio. */
   @IsOptional()
   @IsString()
   description?: string | null;

   @ApiPropertyOptional({
      example: 'Brace, descend below parallel, and drive up.',
      nullable: true,
   })
   /** Instrucciones opcionales de ejecucion. */
   @IsOptional()
   @IsString()
   instructions?: string | null;

   @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.LEGS })
   /** Grupo muscular principal al que pertenece el ejercicio. */
   @IsEnum(MuscleGroup)
   muscleGroup!: MuscleGroup;

   @ApiProperty({ enum: ExerciseCategory, example: ExerciseCategory.STRENGTH })
   /** Categoria funcional del ejercicio para calculo de records personales. */
   @IsEnum(ExerciseCategory)
   category!: ExerciseCategory;

   @ApiPropertyOptional({ example: 'Barbell', nullable: true })
   /** Material o implemento principal necesario para el ejercicio. */
   @IsOptional()
   @IsString()
   equipment?: string | null;

   @ApiPropertyOptional({ example: true, default: false })
   /** Indica si el ejercicio es multiarticular. */
   @IsOptional()
   @IsBoolean()
   isCompound?: boolean;
}
