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
   ApiBadRequestResponse,
   ApiBody,
   ApiTooManyRequestsResponse,
   ApiCreatedResponse,
   ApiBearerAuth,
   ApiForbiddenResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiQuery,
   ApiTags,
   ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import type { User, UsersListResponse } from '@gym-app/types';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { WRITE_ENDPOINT_RATE_LIMIT } from '../rate-limit/rate-limit.constants';

/**
 * Controlador REST para gestionar usuarios.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('users')
export class UsersController {
   /**
    * Crea una nueva instancia del controlador de usuarios.
    *
    * @param usersService - Servicio de dominio de usuarios
    */
   constructor(private readonly usersService: UsersService) {}

   /**
    * Devuelve el listado de usuarios.
    *
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de usuarios por pagina
    * @returns Listado de usuarios
    */
   @ApiOperation({ summary: 'Listar usuarios' })
   @ApiQuery({
      name: 'page',
      required: false,
      description: 'Numero de pagina base cero.',
      example: 0,
   })
   @ApiQuery({
      name: 'limit',
      required: false,
      description: 'Cantidad maxima de usuarios por pagina.',
      example: 10,
   })
   @ApiQuery({
      name: 'role',
      required: false,
      description: 'Filtro de rol.',
      example: 'USER',
   })
   @ApiOkResponse({
      description: 'Listado paginado de usuarios.',
      type: UsersListResponseDto,
   })
   @Get()
   @Roles(UserRole.ADMIN, UserRole.COACH)
   findAll(
      @CurrentUser() user: AuthenticatedUser,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('search') search?: string,
      @Query('role') roleFilter?: UserRole,
   ): Promise<UsersListResponse> {
      const parsedPage = Number.parseInt(page ?? '0', 10);
      const parsedLimit = Number.parseInt(limit ?? '10', 10);

      return this.usersService.findAll(
         user,
         Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage, 0),
         Number.isNaN(parsedLimit)
            ? 10
            : Math.min(Math.max(parsedLimit, 1), 100),
         search ?? '',
         roleFilter as UserRole,
      );
   }

   /**
    * Busca un usuario por su identificador.
    *
    * @param id - Identificador del usuario
    * @returns Usuario encontrado
    */
   @ApiOperation({ summary: 'Obtener usuario por id' })
   @ApiOkResponse({
      description: 'Usuario encontrado.',
      type: UserResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
   @Get(':id')
   @Roles(UserRole.ADMIN, UserRole.COACH)
   findOne(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<User> {
      return this.usersService.findOne(user, id);
   }

   /**
    * Crea un nuevo usuario.
    *
    * @param user - Usuario autenticado que solicita el recurso
    * @param createUserDto - Datos de creacion del usuario
    * @returns Usuario creado
    */
   @ApiOperation({ summary: 'Crear usuario' })
   @ApiCreatedResponse({
      description:
         'Usuario creado correctamente. La cuenta queda verificada y se envía una contraseña temporal por email.',
      type: UserResponseDto,
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Post()
   @Roles(UserRole.ADMIN, UserRole.COACH)
   create(
      @CurrentUser() user: AuthenticatedUser,
      @Body() createUserDto: CreateUserDto,
   ): Promise<User> {
      return this.usersService.create(user, createUserDto);
   }

   /**
    * Actualiza parcialmente un usuario existente.
    *
    * @param id - Identificador del usuario
    * @param updateUserDto - Datos de actualizacion parcial
    * @returns Usuario actualizado
    */
   @ApiOperation({ summary: 'Actualizar usuario' })
   @ApiOkResponse({
      description: 'Usuario actualizado correctamente.',
      type: UserResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Patch(':id')
   @Roles(UserRole.ADMIN)
   update(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
   ): Promise<User> {
      return this.usersService.update(id, updateUserDto);
   }

   /**
    * Elimina un usuario por su identificador.
    *
    * @param id - Identificador del usuario
    * @returns Usuario eliminado
    */
   @ApiOperation({ summary: 'Eliminar usuario' })
   @ApiOkResponse({
      description: 'Usuario eliminado correctamente.',
      type: UserResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Usuario no encontrado.' })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Delete(':id')
   @Roles(UserRole.ADMIN)
   remove(@Param('id') id: string): Promise<User> {
      return this.usersService.remove(id);
   }

   /**
    * Cambia el estado de un usuario.
    *
    * @param id - Identificador del usuario
    * @param isActive - Nuevo estado del usuario
    * @returns Usuario actualizado
    */
   @ApiOperation({ summary: 'Cambiar estado de usuario' })
   @ApiBody({ type: ChangeUserStatusDto })
   @ApiOkResponse({
      description: 'Estado del usuario actualizado correctamente.',
      type: UserResponseDto,
   })
   @ApiBadRequestResponse({
      description: 'Payload inválido o intento de cambiar el estado propio.',
   })
   @ApiUnauthorizedResponse({
      description: 'Token ausente, inválido o expirado.',
   })
   @ApiForbiddenResponse({
      description:
         'El usuario autenticado no tiene permiso para cambiar este estado.',
   })
   @ApiNotFoundResponse({
      description: 'Usuario no encontrado o fuera del ámbito del coach.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Patch(':id/status')
   @Roles(UserRole.ADMIN, UserRole.COACH)
   changeStatus(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
      @Body() statusDto: ChangeUserStatusDto,
   ): Promise<User> {
      return this.usersService.changeStatus(user, id, statusDto.isActive);
   }
}
