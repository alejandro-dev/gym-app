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
   ApiCreatedResponse,
   ApiBearerAuth,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiQuery,
   ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import type { User, UsersListResponse } from '@gym-app/types';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';

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
   @ApiOkResponse({
      description: 'Listado paginado de usuarios.',
      type: UsersListResponseDto,
   })
   @Get()
   @Roles(UserRole.ADMIN, UserRole.COACH)
   findAll(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
   ): Promise<UsersListResponse> {
      const parsedPage = Number.parseInt(page ?? '0', 10);
      const parsedLimit = Number.parseInt(limit ?? '10', 10);

      return this.usersService.findAll(
         Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage, 0),
         Number.isNaN(parsedLimit)
            ? 10
            : Math.min(Math.max(parsedLimit, 1), 100),
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
   findOne(@Param('id') id: string): Promise<User> {
      return this.usersService.findOne(id);
   }

   /**
    * Crea un nuevo usuario.
    *
    * @param createUserDto - Datos de creacion del usuario
    * @returns Usuario creado
    */
   @ApiOperation({ summary: 'Crear usuario' })
   @ApiCreatedResponse({
      description:
         'Usuario creado correctamente. La cuenta queda verificada y se envía una contraseña temporal por email.',
      type: UserResponseDto,
   })
   @Post()
   @Roles(UserRole.ADMIN)
   create(@Body() createUserDto: CreateUserDto): Promise<User> {
      return this.usersService.create(createUserDto);
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
   @Delete(':id')
   @Roles(UserRole.ADMIN)
   remove(@Param('id') id: string): Promise<User> {
      return this.usersService.remove(id);
   }
}
