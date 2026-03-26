import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WorkoutSetsService } from './workout-sets.service';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { WorkoutSetResponseDto } from './dto/workout-set-response.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Controlador base para exponer endpoints del dominio de series de entrenamiento.
 */
@ApiTags('workout-sets')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
@Controller('workout-sets')
export class WorkoutSetsController {
  /**
   * Crea una nueva instancia del controlador de series de entrenamiento.
   *
   * @param workoutSetsService - Servicio de dominio de series de entrenamiento
   */
  constructor(private readonly workoutSetsService: WorkoutSetsService) {}

  /**
   * Devuelve el listado de series de entrenamiento.
   *
   * @param user - Usuario autenticado
   * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
   * @returns Listado de series de entrenamiento
   */
  @ApiOperation({ summary: 'Listar series de entrenamiento' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Filtra por identificador de usuario. Solo aplica para roles con acceso ampliado.',
  })
  @ApiOkResponse({
    description: 'Listado de series de entrenamiento.',
    type: WorkoutSetResponseDto,
    isArray: true,
  })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('userId') userId?: string,
  ): Promise<WorkoutSetResponseDto[]> {
    return this.workoutSetsService.findAll(user, userId);
  }

  /**
   * Busca una serie de entrenamiento por su identificador.
   *
   * @param user - Usuario autenticado
   * @param id - Identificador de la serie de entrenamiento
   * @returns Serie de entrenamiento encontrada
   */
  @ApiOperation({ summary: 'Obtener serie de entrenamiento por id' })
  @ApiOkResponse({
    description: 'Serie de entrenamiento encontrada.',
    type: WorkoutSetResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<WorkoutSetResponseDto> {
    return this.workoutSetsService.findOne(user, id);
  }

  /**
   * Crea una nueva serie de entrenamiento.
   *
   * @param createWorkoutSetDto - Datos de creacion de la serie de entrenamiento
   * @returns Serie de entrenamiento creada
   */
  @ApiOperation({ summary: 'Crear serie de entrenamiento' })
  @ApiCreatedResponse({
    description: 'Serie de entrenamiento creada correctamente.',
    type: WorkoutSetResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe una serie con la misma sesion, ejercicio y numero.',
  })
  @Post()
  create(
    @Body() createWorkoutSetDto: CreateWorkoutSetDto,
  ): Promise<WorkoutSetResponseDto> {
    return this.workoutSetsService.create(createWorkoutSetDto);
  }

  /**
   * Actualiza parcialmente una serie de entrenamiento existente.
   *
   * @param user - Usuario autenticado
   * @param id - Identificador de la serie de entrenamiento
   * @param updateWorkoutSetDto - Datos de actualizacion parcial
   * @returns Serie de entrenamiento actualizada
   */
  @ApiOperation({ summary: 'Actualizar serie de entrenamiento' })
  @ApiOkResponse({
    description: 'Serie de entrenamiento actualizada correctamente.',
    type: WorkoutSetResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
  @ApiConflictResponse({
    description: 'Ya existe una serie con la misma sesion, ejercicio y numero.',
  })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateWorkoutSetDto: UpdateWorkoutSetDto,
  ): Promise<WorkoutSetResponseDto> {
    return this.workoutSetsService.update(user, id, updateWorkoutSetDto);
  }

  /**
   * Elimina una serie de entrenamiento por su identificador.
   *
   * @param user - Usuario autenticado
   * @param id - Identificador de la serie de entrenamiento
   * @returns Serie de entrenamiento eliminada
   */
  @ApiOperation({ summary: 'Eliminar serie de entrenamiento' })
  @ApiOkResponse({
    description: 'Serie de entrenamiento eliminada correctamente.',
    type: WorkoutSetResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<WorkoutSetResponseDto> {
    return this.workoutSetsService.remove(user, id);
  }
}
