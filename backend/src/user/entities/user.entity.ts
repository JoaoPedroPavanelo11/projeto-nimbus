import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { userRole } from '../enums/user.role.enums.js';
import { Ticket } from '../../tickets/entities/ticket.entity.js';

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length:150 })
    nome: string;

    @Column({ unique: true})
    email: string;

    @Column()
    senha: string;

    @Column({
        type: 'enum',
        enum: userRole,
        default: userRole.MEMBER
    })
    role: userRole;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
    createdTickets: Ticket[];

    @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
    assignedTickets: Ticket[];
}
