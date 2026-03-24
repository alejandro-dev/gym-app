import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
   ApiBearerAuth,
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
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Controlador base para exponer endpoints del dominio de records personales.
 */
@ApiTags('personal-records')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('personal-records')
@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
export class PersonalRecordsController {
   /**
    * Crea una nueva instancia del controlador de records personales.
    *
    * @param personalRecordsService - Servicio de dominio de records personales
    */
   constructor(private readonly personalRecordsService: PersonalRecordsService) {}

   /**
    * Devuelve el listado de records personales.
    *
    * @param user - Usuario autenticado
    * @returns Listado de records personales
    */
   @ApiOperation({ summary: 'Listar records personales' })
   @ApiOkResponse({
      description: 'Listado de records personales.',
      type: PersonalRecordResponseDto,
      isArray: true,
   })
   @Get()
   findAll(@CurrentUser() user: AuthenticatedUser): Promise<PersonalRecordResponseDto[]> {
      return this.personalRecordsService.findAll(user);
   }

   /**
    * Busca un record personal por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record personal
    * @returns Record personal encontrado
    */
   @ApiOperation({ summary: 'Obtener record personal por id' })
   @ApiOkResponse({
      description: 'Record personal encontrado.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Get(':id')
   findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.findOne(user, id);
   }

   /**
    * Crea un nuevo record personal.
    *
    * @param createPersonalRecordDto - Datos de creacion del record personal
    * @returns Record personal creado
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
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record personal
    * @param updatePersonalRecordDto - Datos de actualizacion parcial
    * @returns Record personal actualizado
    */
   @ApiOperation({ summary: 'Actualizar record personal' })
   @ApiOkResponse({
      description: 'Record personal actualizado correctamente.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Patch(':id')
   update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() updatePersonalRecordDto: UpdatePersonalRecordDto): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.update(user, id, updatePersonalRecordDto);
   }

   /**
    * Elimina un record personal por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record personal
    * @returns Record personal eliminado
    */
   @ApiOperation({ summary: 'Eliminar record personal' })
   @ApiOkResponse({
      description: 'Record personal eliminado correctamente.',
      type: PersonalRecordResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Record personal no encontrado.' })
   @Delete(':id')
   remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<PersonalRecordResponseDto> {
      return this.personalRecordsService.remove(user,id);
   }
}
