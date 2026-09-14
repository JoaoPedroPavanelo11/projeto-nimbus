import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' } // Esse metodo signOptions aceita apenas datas com ''
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
