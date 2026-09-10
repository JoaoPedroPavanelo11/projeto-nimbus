import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { userRole } from '../enums/user.role.enums.js';

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
}
