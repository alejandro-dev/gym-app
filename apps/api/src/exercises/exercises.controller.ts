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
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

/**
 * Controlador base para exponer endpoints del dominio de ejercicios.
 */
@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
	/**
	 * Crea una nueva instancia del controlador de ejercicios.
	 *
	 * @param exercisesService - Servicio de dominio de ejercicios
	 */
	constructor(private readonly exercisesService: ExercisesService) {}

	/**
	 * Devuelve el listado de ejercicios.
	 *
	 * @returns Listado de ejercicios
	 */
	@ApiOperation({ summary: 'Listar ejercicios' })
	@ApiOkResponse({
		description: 'Listado de ejercicios.',
		type: ExerciseResponseDto,
		isArray: true,
	})
	@Get()
	@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
	findAll(): Promise<ExerciseResponseDto[]> {
		return this.exercisesService.findAll();
	}

	/**
	 * Busca un ejercicio por su identificador.
	 *
	 * @param id - Identificador del ejercicio
	 * @returns Ejercicio encontrado
	 */
	@ApiOperation({ summary: 'Obtener ejercicio por id' })
	@ApiOkResponse({
		description: 'Ejercicio encontrado.',
		type: ExerciseResponseDto,
	})
	@ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
	@Get(':id')
	@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
	findOne(@Param('id') id: string): Promise<ExerciseResponseDto> {
		return this.exercisesService.findOne(id);
	}

	/**
	 * Crea un nuevo ejercicio.
	 *
	 * @param createExerciseDto - Datos de creacion del ejercicio
	 * @returns Ejercicio creado
	 */
	@ApiOperation({ summary: 'Crear ejercicio' })
	@ApiCreatedResponse({
		description: 'Ejercicio creado correctamente.',
		type: ExerciseResponseDto,
	})
	@ApiConflictResponse({
		description: 'Ya existe un ejercicio con el mismo nombre o slug.',
	})
	@Roles(UserRole.ADMIN, UserRole.COACH)
	@Post()
	create(@Body() createExerciseDto: CreateExerciseDto): Promise<ExerciseResponseDto> {
		return this.exercisesService.create(createExerciseDto);
	}

	/**
	 * Actualiza parcialmente un ejercicio existente.
	 *
	 * @param id - Identificador del ejercicio
	 * @param updateExerciseDto - Datos de actualizacion parcial
	 * @returns Ejercicio actualizado
	 */
	@ApiOperation({ summary: 'Actualizar ejercicio' })
	@ApiOkResponse({
		description: 'Ejercicio actualizado correctamente.',
		type: ExerciseResponseDto,
	})
	@ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
	@ApiConflictResponse({
		description: 'Ya existe un ejercicio con el mismo nombre o slug.',
	})
	@Patch(':id')
	@Roles(UserRole.ADMIN, UserRole.COACH)
	update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto):Promise<ExerciseResponseDto> {
		return this.exercisesService.update(id, updateExerciseDto);
	}

	/**
	 * Elimina un ejercicio por su identificador.
	 *
	 * @param id - Identificador del ejercicio
	 * @returns Ejercicio eliminado
	 */
	@ApiOperation({ summary: 'Eliminar ejercicio' })
	@ApiOkResponse({
		description: 'Ejercicio eliminado correctamente.',
		type: ExerciseResponseDto,
	})
	@ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
	@Delete(':id')
	@Roles(UserRole.ADMIN, UserRole.COACH)
	remove(@Param('id') id: string): Promise<ExerciseResponseDto> {
		return this.exercisesService.remove(id);
	}
}
