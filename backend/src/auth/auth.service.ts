import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.userService.findByEmail(dto.email); // Reutilizei o metodo que eu fiz na user service para ver email
    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas!');
    }

    const senhaValida = await bcrypt.compare(dto.senha ,usuario.senha) // Função para comparar a senha que é recebida com a senha que o usuario cadastrou
    if(!senhaValida){
      throw new UnauthorizedException('Credenciais invalidas!')
    }

    const payload = { sub : usuario.id, email: usuario.email, role: usuario.role }; // São os dados que irão ficar guardados dentro do token

    return { access_token: this.jwtService.sign(payload) };
  }
}
