import { Entity, PrimaryGeneratedColumn, Column, CreatedDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length:150 })
    nome: string;

    @Column({ unique: true})
    email: string;

    @Column({ select: false})
    senha: string;

    @CreatedDateColumn
    createdAt: Date;

    @UpdateDateColumn
    updatedAt: Date;
}
