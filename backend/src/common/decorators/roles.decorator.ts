import { SetMetadata } from '@nestjs/common';
import { userRole } from '../../user/enums/user.role.enums.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: userRole[]) => SetMetadata(ROLES_KEY, roles);
