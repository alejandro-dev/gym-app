import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '4f7c2b1d9e8a6c5b3f1a0d9e8c7b6a5f' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  token!: string;
}
