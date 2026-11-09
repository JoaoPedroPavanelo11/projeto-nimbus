import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity.js';
import { User } from '../../user/entities/user.entity.js';

@Entity('ticket_comment')
export class TicketComment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Ticket, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'authorId' })
    author: User | null;

    // Sem limite no banco; o tamanho maximo é validado no DTO (igual ao description do ticket)
    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}