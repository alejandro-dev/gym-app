import { Prisma } from '@prisma/client';
import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

/**
 * Servicio base para operaciones del dominio de ejercicios.
 */
@Injectable()
export class ExercisesService {
	/**
	 * Crea una nueva instancia del servicio de ejercicios.
	 *
	 * @param prisma - Cliente de Prisma compartido por la aplicación
	 */
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Selecciona los campos de un ejercicio para la consulta.
	 */
	private readonly exerciseSelect = {
		id: true,
		name: true,
		slug: true,
		description: true,
		instructions: true,
		muscleGroup: true,
		equipment: true,
		isCompound: true,
		createdAt: true,
		updatedAt: true,
	} satisfies Prisma.ExerciseSelect;

	/**
	 * Crea un ejercicio y devuelve la version publica del registro.
	 */
	async create(createExerciseDto: CreateExerciseDto) {
		try {
			return await this.prisma.exercise.create({
				data: this.toCreateData(createExerciseDto),
				select: this.exerciseSelect,
			});
		} catch (error) {
			this.handlePrismaError(error);
		}
	}

	/**
	 * Obtiene todos los ejercicios ordenados por fecha de creacion descendente.
	 */
	async findAll() {
		return this.prisma.exercise.findMany({
			select: this.exerciseSelect,
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	/**
	 * Obtiene un ejercicio por id.
	 * Lanza `NotFoundException` si no existe.
	 */
	async findOne(id: string) {
		// Consulta de un ejercicio por id
		const exercise = await this.prisma.exercise.findUnique({
			where: { id },
			select: this.exerciseSelect,
		});

		// Si no existe lanza NotFoundException
		if (!exercise) throw new NotFoundException(`Exercise with id "${id}" not found`);

		return exercise;
	}

	/**
	 * Actualiza un ejercicio existente.
	 * Lanza `NotFoundException` si el ejercicio no existe.
	 */
	async update(id: string, updateExerciseDto: UpdateExerciseDto) {
		// Verifica si el ejercicio existe
		await this.ensureExerciseExists(id);

		try {
			return await this.prisma.exercise.update({
				where: { id },
				data: this.toUpdateData(updateExerciseDto),
				select: this.exerciseSelect,
			});
		} catch (error) {
			this.handlePrismaError(error);
		}
	}

	/**
	 * Elimina un ejercicio existente y devuelve el registro eliminado.
	 */
	async remove(id: string) {
		// Verifica si el ejercicio existe
		await this.ensureExerciseExists(id);

		return await this.prisma.exercise.delete({
			where: { id },
			select: this.exerciseSelect,
		});
	}

	/**
	 * Convierte el DTO de creacion al formato esperado por Prisma.
	 */
	private toCreateData(createExerciseDto: CreateExerciseDto): Prisma.ExerciseCreateInput {
		return {
			name: createExerciseDto.name,
			slug: createExerciseDto.slug,
			description: createExerciseDto.description,
			instructions: createExerciseDto.instructions,
			muscleGroup: createExerciseDto.muscleGroup,
			equipment: createExerciseDto.equipment,
			isCompound: createExerciseDto.isCompound ?? false,
		};
	}

	/**
	 * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
	 */
	private toUpdateData(updateExerciseDto: UpdateExerciseDto): Prisma.ExerciseUpdateInput {
		return {
			name: updateExerciseDto.name,
			slug: updateExerciseDto.slug,
			description: updateExerciseDto.description,
			instructions: updateExerciseDto.instructions,
			muscleGroup: updateExerciseDto.muscleGroup,
			equipment: updateExerciseDto.equipment,
			isCompound: updateExerciseDto.isCompound,
		};
	}

	/**
	 * Verifica si el ejercicio existe antes de actualizar o eliminar.
	 */
	private async ensureExerciseExists(id: string) {
		const exercise = await this.prisma.exercise.findUnique({
			where: { id },
			select: { id: true },
		});

		// Si no existe lanza NotFoundException
		if (!exercise) throw new NotFoundException(`Exercise with id "${id}" not found`);
	}

	/**
	 * Traduce errores conocidos de Prisma a excepciones HTTP comprensibles.
	 */
	private handlePrismaError(error: unknown): never {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				const target = Array.isArray(error.meta?.target)
					? error.meta.target.join(', ')
					: 'unique field';

				throw new ConflictException(
					`An exercise with the same ${target} already exists`,
				);
			}
		}

		throw new InternalServerErrorException('Unexpected database error');
	}
}
