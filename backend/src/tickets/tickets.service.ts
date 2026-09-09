import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';

@Injectable()
export class TicketService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>
  ){}

  create(dto: CreateTicketDto){ // ele grava um ticket novo (responsavel por salvar os ticket)
    const ticket = this.ticketsRepository.create(dto);
    return this.ticketsRepository.save(ticket);
  }

  findAll(){ // Metodo para fazer uma consulta (nesse caso ele consulta todos)
    return this.ticketsRepository.find();
  }

  async findOne(id: string){ // Procura um ticket pelo ID esse metodo é usado para apagar e fazer update em outros metodos
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if(!ticket){
      throw new NotFoundException(`Ticket ${id} não encontrado`)
    }
    return ticket;
  }

  async remove(id: string){ // Metodo para apagar um ticket basedo no ID
    const ticket = await this.findOne(id);
    return this.ticketsRepository.remove(ticket);
  }

  async update(id: string, dto: UpdateTicketDto){
    const ticket = await this.ticketsRepository.preload({ id, ...dto })
    if(!ticket){
      throw new NotFoundException(`Ticket ${id} nao encontrado!`);
    }
    return this.ticketsRepository.save(ticket)
  }
}