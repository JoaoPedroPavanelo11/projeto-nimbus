import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { TicketsController } from './tickets.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { TicketHistory } from './entities/ticket-history.entity.js';
import { TicketComment } from './entities/ticket-comment.entity.js';

@Module({
  imports : [TypeOrmModule.forFeature([Ticket, TicketHistory, TicketComment])],
  controllers: [TicketsController],
  providers: [TicketsService,],
})
export class TicketsModule {}
