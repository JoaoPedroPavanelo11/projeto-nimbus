import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { userRole } from '../user/enums/user.role.enums.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';
import { TicketHistory } from './entities/ticket-history.entity.js';
import { TicketComment } from './entities/ticket-comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

const STAFF_ROLES = [userRole.ADMIN, userRole.OFFICER];

@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,

    @InjectRepository(TicketHistory)
    private readonly historyRepository: Repository<TicketHistory>,

    @InjectRepository(TicketComment)
    private readonly commentRepository: Repository<TicketComment>,

  ){}

  create(dto: CreateTicketDto, createdById: string){ // ele grava um ticket novo (responsavel por salvar os ticket)
    const ticket = this.ticketsRepository.create({
      ...dto,
      createdBy: { id: createdById },
    });
    return this.ticketsRepository.save(ticket);
  }

  // Member só vê os proprios tickets; admin/officer veem todos
  findAll(user: AuthenticatedUser){
    const isStaff = STAFF_ROLES.includes(user.role);

    let where;
    if (isStaff) {
      where = {};
    } else {
      where = { createdBy: { id: user.id } };
    }

    return this.ticketsRepository.find({
      where,
      relations: { createdBy: true },
    });
  }

  async findOne(id: string){ // Procura um ticket pelo ID esse metodo é usado para apagar e fazer update em outros metodos
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { createdBy: true, assignedTo: true },
    });
    if(!ticket){
      throw new NotFoundException(`Ticket ${id} não encontrado`)
    }
    return ticket;
  }

  // Metodo para que cada usuario consiga ver o seu proprio ticket
  async findOneForUser(id: string, user: AuthenticatedUser){
    const ticket = await this.findOne(id);
    this.assertCanManage(ticket, user);
    return ticket;
  }

  // So o criador do ticket ou a equipe (admin/officer) podem ver, alterar ou apagar
  private assertCanManage(ticket: Ticket, user: AuthenticatedUser){
    const isOwner = ticket.createdBy.id === user.id;
    const isStaff = STAFF_ROLES.includes(user.role);
    if(!isOwner && !isStaff){
      throw new ForbiddenException('Voce nao tem permissao para acessar este ticket');
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

    const { status, assignedToId, ...rest } = dto;
    const isStaff = STAFF_ROLES.includes(user.role);

    // Status e responsavel so podem ser alterados por admin/officer
    if ((status !== undefined || assignedToId !== undefined) && !isStaff) {
      throw new ForbiddenException('Somente admin ou officer podem alterar status ou responsavel do ticket');
    }

    const updated = await this.ticketsRepository.preload({
      id,
      ...rest,
      ...(status !== undefined && { status }),
      ...(assignedToId !== undefined && { assignedTo: assignedToId ? { id: assignedToId } : null }),
    });
    if(!updated){
      throw new NotFoundException(`Ticket ${id} nao encontrado!`);
    }

    const mudanca: { field: string, oldValue: string | null; newValue: string | null } [] = [];

    const camposSimples = [ 'title', 'description','priority','category','status'] as const;
    for(const campo of camposSimples){
      const novo = dto[campo];
      const atual = ticket[campo];
      if(novo !== undefined && novo !== atual){
        mudanca.push({ field: campo, oldValue: atual ?? null, newValue:novo ?? null })
      }
    }

    if(assignedToId !== undefined){
      const atual = ticket.assignedTo?.id  ?? null;
      if(assignedToId !== atual){ 
        mudanca.push({ field: 'assignedTo', oldValue: atual, newValue: assignedToId })
      }
    }

    const salvo = await this.ticketsRepository.save(updated);

    if(mudanca.length > 0){
      const registro = mudanca.map((m) => 
      this.historyRepository.create({
        ...m,
        ticket: { id },
        changedBy: { id: user.id },
      }))

      await this.historyRepository.save(registro)
    }
    return salvo;
  }

  // Metodo que adiciona um comentario dentro do ticket
  async addComment(id:string, dto: CreateCommentDto, user: AuthenticatedUser){
      await this.findOneForUser(id, user); // Reaproveitei o metodo para checar permissão

      const comentario = this.commentRepository.create({
        content: dto.content,
        ticket : { id },
        author: { id: user.id },
      });

      return this.commentRepository.save(comentario)
  }

  // Lista todos os comentarios do ticket (em ordem de tempo)
  async findComment(id: string, user: AuthenticatedUser ){
    await this.findOneForUser(id, user);

    return this.commentRepository.find({
      where : { ticket: { id } },
      relations : { author: true },
      order: { createdAt: 'ASC' },
    });
  }
}