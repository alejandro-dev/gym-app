import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePersonalRecordDto } from './create-personal-record.dto';

/**
 * Datos permitidos para actualizar parcialmente un record personal.
 */
export class UpdatePersonalRecordDto extends PartialType(
  OmitType(CreatePersonalRecordDto, ['userId', 'exerciseId'] as const),
) {}
