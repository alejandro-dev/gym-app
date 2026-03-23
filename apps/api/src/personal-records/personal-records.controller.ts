import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { PersonalRecordsService } from './personal-records.service';
import { CreatePersonalRecordDto } from './dto/create-personal-record.dto';
import { UpdatePersonalRecordDto } from './dto/update-personal-record.dto';
import { PersonalRecordResponseDto } from './dto/personal-record-response.dto';

/**
 * Controlador base para exponer endpoints del dominio de records personales.
 */
@ApiTags('personal-records')
@Controller('personal-records')
export class PersonalRecordsController {
   /**
    * Crea una nueva instancia del controlador de records personales.
    *
    * @param personalRecordsService - Servicio de dominio de records personales
    */
   constructor(private readonly personalRecordsService: PersonalRecordsService) {}

   /**
    * Devuelve el listado de records personales.
    */
   @ApiOperation({ summary: 'Listar records personales' })
   @ApiOkResponse({
      description: 'Listado de records personales.',
      type: PersonalRecordResponseDto,
      isArray: true,
   })
   @Get()
   findAll(): Promise<PersonalRecordResponseDto[]> {
      return this.personalRecordsService.findAll();
   }

   /**
    * Busca un record personal por su identificador.
    */
   @ApiOperation({ summary: 'Obtener record personal por id' })
   @ApiOkResponse({
      description: 'Record personal encontrado.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.findOne(id);
   }

   /**
    * Crea un nuevo record personal.
    */
   @ApiOperation({ summary: 'Crear record personal' })
   @ApiCreatedResponse({
      description: 'Record personal creado correctamente.',
      type: PersonalRecordResponseDto,
   })
   @Post()
   create(@Body() createPersonalRecordDto: CreatePersonalRecordDto): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.create(createPersonalRecordDto);
   }

   /**
    * Actualiza parcialmente un record personal existente.
    */
   @ApiOperation({ summary: 'Actualizar record personal' })
   @ApiOkResponse({
      description: 'Record personal actualizado correctamente.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Patch(':id')
   update(
      @Param('id') id: string,
      @Body() updatePersonalRecordDto: UpdatePersonalRecordDto,
   ): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.update(id, updatePersonalRecordDto);
   }

   /**
    * Elimina un record personal por su identificador.
    */
   @ApiOperation({ summary: 'Eliminar record personal' })
   @ApiOkResponse({
      description: 'Record personal eliminado correctamente.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Delete(':id')
   remove(@Param('id') id: string): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.remove(id);
   }
}
