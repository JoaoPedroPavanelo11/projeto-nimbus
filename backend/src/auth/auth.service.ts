import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity.js';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity.js';
import { createHash, randomBytes } from 'node:crypto';

// Quanto tempo o refresh token vale
const REFRESH_TOKEN_DIAS = 7;

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.userService.findByEmailComSenha(dto.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas!');
    }

    const senhaValida = await bcrypt.compare(dto.senha ,usuario.senha) // Função para comparar a senha que é recebida com a senha que o usuario cadastrou
    if(!senhaValida){
      throw new UnauthorizedException('Credenciais invalidas!')
    }

    return this.gerarTokens(usuario);
  }

  // Troca um refresh token valido por um par novo. O token usado deixa de valer (rotacao)
  async refresh(refreshToken: string) {
    const registro = await this.refreshTokenRepository.findOne({
      where: { tokenHash: this.hashToken(refreshToken) },
      relations: { user: true },
    });
    if (!registro) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    // Apaga o token usado. Se affected for 0, outra requisicao ja usou esse mesmo token
    const { affected } = await this.refreshTokenRepository.delete({ id: registro.id });
    if (!affected) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    if (registro.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado, faca login novamente');
    }

    return this.gerarTokens(registro.user);
  }

  // Encerra a sessao apagando o refresh token. Nao avisa se o token nao existia
  async logout(refreshToken: string) {
    await this.refreshTokenRepository.delete({ tokenHash: this.hashToken(refreshToken) });
  }

  // Pega o token e criptografa ele em 64 caracteres
  private hashToken(token:string): string{
    return createHash('sha256').update(token).digest('hex');
  }

  // Gera o par de tokens e salva a sessao (o hash do refresh token) no banco
  private async gerarTokens(usuario: Pick<User, 'id' | 'email' | 'role'>) {
    const payload = { sub: usuario.id, email: usuario.email, role: usuario.role }; // São os dados que irão ficar guardados dentro do token
    const access_token = this.jwtService.sign(payload);

    const refresh_token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DIAS * 24 *60 *60 *1000);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        user: { id: usuario.id },
        tokenHash: this.hashToken(refresh_token),
        expiresAt,
      }),
    );

    return { access_token, refresh_token };
  }
}
