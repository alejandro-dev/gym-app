import { Module } from '@nestjs/common';
import { PersonalRecordsService } from './personal-records.service';
import { PersonalRecordsController } from './personal-records.controller';

/**
 * Modulo de funcionalidad para el dominio de records personales.
 */
@Module({
  providers: [PersonalRecordsService],
  controllers: [PersonalRecordsController],
})
export class PersonalRecordsModule {}
