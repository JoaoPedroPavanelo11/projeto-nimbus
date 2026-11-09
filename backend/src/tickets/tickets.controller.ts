import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@ApiTags('Chamados') // serve para organizar a pagina do Swagger em grupos
@ApiBearerAuth() // Tem isso aqui porque precisa de um token
@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.create(createTicketDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.findOneForUser(id, user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTicketDto: UpdateTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.update(id, updateTicketDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ticketsService.remove(id, user);
  }

  @Post(':id/comments')
  addComent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.addComment(id, dto, user);
  }

  @Get(':id/comments')
  findComments(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user:AuthenticatedUser){
    return this.ticketsService.findComment(id, user);
  }
}
