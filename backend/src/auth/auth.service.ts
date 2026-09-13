import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UserService } from '../user/user.service.js';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(private readonly userService: UserService) {}

  async login(dto: LoginDto) {
    const usuario = await this.userService.findByEmail(dto.email); // Reutilizei o metodo que eu fiz na user service para ver email
    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas!');
    }

    const senhaValida = await bcrypt.compare(dto.senha ,usuario.senha) // Função para comparar a senha que é recebida com a senha que o usuario cadastrou
    if(!senhaValida){
      throw new UnauthorizedException('Credenciais invalidas!')
    }

    return { mensagem: 'Login concluido!' } // So da 201 caso o email for valido e a senha for valida
  }
}
