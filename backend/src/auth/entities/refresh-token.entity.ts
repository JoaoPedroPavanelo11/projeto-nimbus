import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity('refresh_token')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Dono do token , caso o usuario for apagado as sessao dele tambem vai ser
    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'varchar', length: 64, unique: true })
    tokenHash: string;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
