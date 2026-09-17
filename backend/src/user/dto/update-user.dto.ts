import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';
import { userRole } from '../enums/user.role.enums.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    // Somente admin pode alterar o cargo (checado na service)
    @IsOptional()
    @IsEnum(userRole)
    role?: userRole;
}
