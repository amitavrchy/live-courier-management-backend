import { SetMetadata } from '@nestjs/common';
import { User_Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: User_Role[]) => SetMetadata(ROLES_KEY, roles);
