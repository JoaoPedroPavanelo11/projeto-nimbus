import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { TicketPriority } from '../enums/ticket-priority.enums.js';
import { TicketStatus } from '../enums/ticket-status.enums.js';
import { Ticket } from './ticket.entity.js';
import { User } from '../../user/entities/user.entity.js';

@Entity('ticket_history')
export class TicketHistory { 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Se o ticket for apagado o historico dele vai ser apagado tambem
    @ManyToOne(() => Ticket, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket;

    // Se o usuario for apagado o historico permanece so some o autor
    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true})
    @JoinColumn({ name: 'changedById' })
    changedBy: User | null;

    @Column({ type: 'varchar', length: 50 })
    field: string;

    @Column({ type: 'text', nullable: true })
    oldValue: string | null;

    @Column({ type: 'text', nullable: true })
    newValue: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}