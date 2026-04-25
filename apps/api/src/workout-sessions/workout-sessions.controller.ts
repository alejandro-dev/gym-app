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
   ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionResponseDto } from './dto/workout-session-response.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { WRITE_ENDPOINT_RATE_LIMIT } from '../rate-limit/rate-limit.constants';

/**
 * Controlador base para exponer endpoints del dominio de sesiones de entrenamiento.
 */
@ApiTags('workout-sessions')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
@Controller('workout-sessions')
export class WorkoutSessionsController {
   /**
    * Crea una nueva instancia del controlador de sesiones de entrenamiento.
    *
    * @param workoutSessionsService - Servicio de dominio de sesiones de entrenamiento
    */
   constructor(
      private readonly workoutSessionsService: WorkoutSessionsService,
   ) {}

   /**
    * Devuelve el listado de sesiones de entrenamiento.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de sesiones de entrenamiento
    */
   @ApiOperation({ summary: 'Listar sesiones de entrenamiento' })
   @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description:
         'Filtra por identificador de usuario. Solo aplica para roles con acceso ampliado.',
   })
   @ApiOkResponse({
      description: 'Listado de sesiones de entrenamiento.',
      type: WorkoutSessionResponseDto,
      isArray: true,
   })
   @Get()
   findAll(
      @CurrentUser() user: AuthenticatedUser,
      @Query('userId') userId?: string,
   ): Promise<WorkoutSessionResponseDto[]> {
      return this.workoutSessionsService.findAll(user, userId);
   }

   /**
    * Busca una sesion de entrenamiento por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento encontrada
    */
   @ApiOperation({ summary: 'Obtener sesion de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento encontrada.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Sesion de entrenamiento no encontrada.',
   })
   @Get(':id')
   findOne(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.findOne(user, id);
   }

   /**
    * Crea una nueva sesion de entrenamiento.
    *
    * @param createWorkoutSessionDto - Datos de creacion de la sesion de entrenamiento
    * @returns Sesion de entrenamiento creada
    */
   @ApiOperation({ summary: 'Crear sesion de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Sesion de entrenamiento creada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Post()
   create(
      @Body() createWorkoutSessionDto: CreateWorkoutSessionDto,
   ): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.create(createWorkoutSessionDto);
   }

   /**
    * Actualiza parcialmente una sesion de entrenamiento existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @param updateWorkoutSessionDto - Datos de actualizacion parcial
    * @returns Sesion de entrenamiento actualizada
    */
   @ApiOperation({ summary: 'Actualizar sesion de entrenamiento' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento actualizada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Sesion de entrenamiento no encontrada.',
   })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Patch(':id')
   update(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
      @Body() updateWorkoutSessionDto: UpdateWorkoutSessionDto,
   ): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.update(
         user,
         id,
         updateWorkoutSessionDto,
      );
   }

   /**
    * Elimina una sesion de entrenamiento por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento eliminada
    */
   @ApiOperation({ summary: 'Eliminar sesion de entrenamiento' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento eliminada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Sesion de entrenamiento no encontrada.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Delete(':id')
   remove(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.remove(user, id);
   }

   /**
    * Completa una sesion de entrenamiento.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador de la sesion de entrenamiento
    * @returns Sesion de entrenamiento completada
    */
   @ApiOperation({ summary: 'Completar sesion de entrenamiento' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento completada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Sesion de entrenamiento no encontrada.',
   })
   @ApiConflictResponse({
      description: 'La sesion de entrenamiento ya estaba completada.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Post(':id/complete')
   completeSession(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.completeSession(user, id);
   }
}
