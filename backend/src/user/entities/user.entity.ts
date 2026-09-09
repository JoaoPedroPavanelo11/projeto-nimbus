import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length:150 })
    nome: string;

    @Column
    email: string;
}
