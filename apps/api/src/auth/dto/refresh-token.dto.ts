import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para renovar tokens usando el refresh token actual.
 */
export class RefreshTokenDto {
  @ApiProperty({
    example: 'optional-when-using-httpOnly-cookie',
    required: false,
  })
  /** Refresh token JWT emitido previamente durante login o refresh. */
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
