import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { userRole } from './enums/user.role.enums.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';
import bcrypt from 'bcrypt';

const STAFF_ROLES = [userRole.ADMIN, userRole.OFFICER];

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async createUser(dto: CreateUserDto): Promise<Omit<User, 'senha'>> {

    //Verificação de email
    const usuarioExistente = await this.findByEmail(dto.email);
    if (usuarioExistente) {
      throw new ConflictException('Este email ja está sendo utilizado')
    }

    // Crio o usuario e criptografo a senha
    const user = this.userRepository.create({
      ...dto,
      senha: await bcrypt.hash(dto.senha, 10),
    });

    // Salvo o usuario
    const saved = await this.userRepository.save(user);

    //Retorna o objeto sem a senha
    const { senha: _senha, ...rest } = saved
    return rest;
  }

  // Ver dados: o proprio usuario ou staff (admin/officer)
  private assertSelfOrStaff(targetId: string, requester: AuthenticatedUser){
    const isSelf = targetId === requester.id;
    const isStaff = STAFF_ROLES.includes(requester.role);
    if(!isSelf && !isStaff){
      throw new ForbiddenException('Voce nao tem permissao para acessar este usuario');
    }
  }

  // Editar dados: so o proprio usuario ou admin
  private assertSelfOrAdmin(targetId: string, requester: AuthenticatedUser){
    const isSelf = targetId === requester.id;
    if(!isSelf && requester.role !== userRole.ADMIN){
      throw new ForbiddenException('Voce nao tem permissao para alterar este usuario');
    }
  }

  async findAll(): Promise<Omit<User, 'senha'>[]> {
    const usuarios = await this.userRepository.find();
    return usuarios.map(({ senha: _senha, ...rest }) => rest);
  }

  async findOne(id: string, requester: AuthenticatedUser): Promise<Omit<User, 'senha'>> {
    this.assertSelfOrStaff(id, requester);
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} nao encontrado!`)
    }
    const { senha: _senha, ...rest } = usuario;
    return rest;
  }

  async update(id: string, dto: UpdateUserDto, requester: AuthenticatedUser): Promise<Omit<User, 'senha'>> {
    this.assertSelfOrAdmin(id, requester);

    const { role, senha, ...rest } = dto;

    // So admin pode promover/rebaixar outro usuario
    if (role !== undefined && requester.role !== userRole.ADMIN) {
      throw new ForbiddenException('Somente admin pode alterar o cargo do usuario');
    }

    if (dto.email) {
      const existente = await this.findByEmail(dto.email);
      if (existente && existente.id !== id) {
        throw new ConflictException('Este email ja esta sendo utilizado');
      }
    }

    const updated = await this.userRepository.preload({
      id,
      ...rest,
      ...(senha !== undefined && { senha: await bcrypt.hash(senha, 10) }),
      ...(role !== undefined && { role }),
    });
    if (!updated) {
      throw new NotFoundException(`Usuario ${id} nao encontrado!`);
    }

    const saved = await this.userRepository.save(updated);
    const { senha: _senha, ...rest2 } = saved;
    return rest2;
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} nao encontrado!`);
    }
    await this.userRepository.remove(usuario);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
