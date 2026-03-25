import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Traduce errores conocidos de Prisma a excepciones HTTP comprensibles.
 */
export function handlePrismaError(error: unknown, entity = 'resource'): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : 'unique field';

      throw new ConflictException(
        `A ${entity} with the same ${target} already exists`,
      );
    }
  }

  throw new InternalServerErrorException('Unexpected database error');
}
