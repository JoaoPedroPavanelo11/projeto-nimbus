import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto.js';
import { TicketStatus } from '../enums/ticket-status.enums.js';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    // null = remove a atribuicao atual
    @IsOptional()
    @IsUUID()
    assignedToId?: string | null;
}
