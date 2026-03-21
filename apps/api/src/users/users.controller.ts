import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * Controlador REST para gestionar usuarios.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH)
@Controller('users')
export class UsersController {
	/**
	 * Crea una nueva instancia del controlador de usuarios.
	 *
	 * @param usersService - Servicio de dominio de usuarios
	 */
	constructor(private readonly usersService: UsersService) {}

	/**
	 * Crea un nuevo usuario.
	 */
	@ApiOperation({ summary: 'Crear usuario' })
	@ApiOkResponse({ description: 'Usuario creado correctamente.' })
	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	/**
	 * Devuelve el listado de usuarios.
	 */
	@ApiOperation({ summary: 'Listar usuarios' })
	@ApiOkResponse({ description: 'Listado de usuarios.' })
	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	/**
	 * Busca un usuario por su identificador.
	 */
	@ApiOperation({ summary: 'Obtener usuario por id' })
	@ApiOkResponse({ description: 'Usuario encontrado.' })
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	/**
	 * Actualiza parcialmente un usuario existente.
	 */
	@ApiOperation({ summary: 'Actualizar usuario' })
	@ApiOkResponse({ description: 'Usuario actualizado correctamente.' })
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	/**
	 * Elimina un usuario por su identificador.
	 */
	@ApiOperation({ summary: 'Eliminar usuario' })
	@ApiOkResponse({ description: 'Usuario eliminado correctamente.' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
