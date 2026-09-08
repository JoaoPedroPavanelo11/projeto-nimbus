import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { TicketPriority } from '../enums/ticket-priority.enums.js';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(700)
    description: string;

    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;
}
