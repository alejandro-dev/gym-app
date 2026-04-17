import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representacion publica de un usuario.
 */
export class UserResponseDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador unico del usuario. */
   id!: string;

   @ApiProperty({ example: 'alex@gymapp.dev' })
   /** Email unico del usuario. */
   email!: string;

   @ApiPropertyOptional({ example: 'alextrainer', nullable: true })
   /** Nombre de usuario publico, si existe. */
   username!: string | null;

   @ApiPropertyOptional({ example: 'Alex', nullable: true })
   /** Nombre del usuario, si existe. */
   firstName!: string | null;

   @ApiPropertyOptional({ example: 'Trainer', nullable: true })
   /** Apellido del usuario, si existe. */
   lastName!: string | null;

   @ApiProperty({ example: 'ADMIN', enum: ['USER', 'ADMIN', 'COACH'] })
   /** Rol del usuario. */
   role!: 'USER' | 'ADMIN' | 'COACH';

   @ApiPropertyOptional({
      example: 'cm9j8u4p10000fkoq2m9is1coach',
      nullable: true,
   })
   /** Identificador del coach asignado, si existe. */
   coachId!: string | null;

   @ApiPropertyOptional({ example: 82.5, nullable: true })
   /** Peso corporal en kilogramos, si existe. */
   weightKg!: number | null;

   @ApiPropertyOptional({ example: 178, nullable: true })
   /** Altura en centimetros, si existe. */
   heightCm!: number | null;

   @ApiPropertyOptional({
      example: '1992-06-14T00:00:00.000Z',
      nullable: true,
   })
   /** Fecha de nacimiento serializada en ISO, si existe. */
   birthDate!: string | null;

   @ApiProperty({ example: true })
   /** Estado del usuario. */
   isActive!: boolean;

   @ApiProperty({ example: '2026-03-28T15:10:00.000Z' })
   /** Fecha de creacion serializada en ISO. */
   createdAt!: string;

   @ApiProperty({ example: '2026-03-28T15:10:00.000Z' })
   /** Fecha de ultima actualizacion serializada en ISO. */
   updatedAt!: string;
}
