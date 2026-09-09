import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { bcrypt } from 'bcrypt';


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

    const user = this.userRepository.create({
      ...dto,
      senha: await bcrypt.hash(dto.senha, 10),
    });

    const saved = await this.userRepository.save(user);
    const { senha, ...rest } = saved
    return rest;
  }

  async findOne(id: string) {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} nao encontrado!`)
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
