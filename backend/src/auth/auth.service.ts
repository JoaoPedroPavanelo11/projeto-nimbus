import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    // TODO: validar credenciais contra o UserService e assinar um JWT.
    return 'This action logs a user in';
  }
}
