import { userRole } from '../../user/enums/user.role.enums.js';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: userRole;
}
