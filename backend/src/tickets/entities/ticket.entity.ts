import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { TicketPriority } from '../enums/ticket-priority.enums.js';
import { TicketStatus } from '../enums/ticket-status.enums.js';
import { User } from '../../user/entities/user.entity.js';

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length:120 })
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column({ length: 50, nullable: true})
    category: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


    @ManyToOne(() => User, (user) => user.createdTickets, { onDelete: 'CASCADE', nullable: false }) 
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @ManyToOne(() => User, (user) => user.assignedTickets, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User | null;
}