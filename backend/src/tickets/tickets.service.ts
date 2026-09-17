import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { userRole } from '../user/enums/user.role.enums.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';

const STAFF_ROLES = [userRole.ADMIN, userRole.OFFICER];

@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>
  ){}

  create(dto: CreateTicketDto, createdById: string){ // ele grava um ticket novo (responsavel por salvar os ticket)
    const ticket = this.ticketsRepository.create({
      ...dto,
      createdBy: { id: createdById },
    });
    return this.ticketsRepository.save(ticket);
  }

  findAll(){ // Metodo para fazer uma consulta (nesse caso ele consulta todos)
    return this.ticketsRepository.find();
  }

  async findOne(id: string){ // Procura um ticket pelo ID esse metodo é usado para apagar e fazer update em outros metodos
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if(!ticket){
      throw new NotFoundException(`Ticket ${id} não encontrado`)
    }
    return ticket;
  }

  // Só quem criou o ticket ou um admin/officer pode alterar ou apagar
  private assertCanManage(ticket: Ticket, user: AuthenticatedUser){
    const isOwner = ticket.createdBy.id === user.id;
    const isStaff = STAFF_ROLES.includes(user.role);
    if(!isOwner && !isStaff){
      throw new ForbiddenException('Voce nao tem permissao para alterar este ticket');
    }
  }

  async remove(id: string, user: AuthenticatedUser){ // Metodo para apagar um ticket basedo no ID
    const ticket = await this.findOne(id);
    this.assertCanManage(ticket, user);
    return this.ticketsRepository.remove(ticket);
  }

  async update(id: string, dto: UpdateTicketDto, user: AuthenticatedUser){
    const ticket = await this.findOne(id);
    this.assertCanManage(ticket, user);

    const updated = await this.ticketsRepository.preload({ id, ...dto })
    if(!updated){
      throw new NotFoundException(`Ticket ${id} nao encontrado!`);
    }
    return this.ticketsRepository.save(updated)
  }
}