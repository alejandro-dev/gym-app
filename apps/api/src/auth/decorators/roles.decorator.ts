import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Metadata decorator para declarar los roles permitidos en una ruta.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
