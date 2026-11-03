import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { AppModule } from './app.module.js';
import { User } from './user/entities/user.entity.js';
import { userRole } from './user/enums/user.role.enums.js';

// Cria o primeiro admin a partir das variaveis ADMIN_* do .env
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try {
    const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_SENHA) {
      throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA no .env antes de rodar o seed');
    }
    if (ADMIN_SENHA.length < 6) {
      throw new Error('ADMIN_SENHA precisa ter no minimo 6 caracteres');
    }

    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Se o email ja existe, so garante que ele seja admin (rodar de novo nao duplica)
    const existente = await userRepository.findOneBy({ email: ADMIN_EMAIL });
    if (existente) {
      if (existente.role !== userRole.ADMIN) {
        existente.role = userRole.ADMIN;
        await userRepository.save(existente);
        console.log(`Usuario ${ADMIN_EMAIL} promovido para admin`);
      } else {
        console.log(`Admin ${ADMIN_EMAIL} ja existe, nada a fazer`);
      }
      return;
    }

    const admin = userRepository.create({
      nome: ADMIN_NOME ?? 'Administrador',
      email: ADMIN_EMAIL,
      senha: await bcrypt.hash(ADMIN_SENHA, 10),
      role: userRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log(`Admin ${ADMIN_EMAIL} criado com sucesso`);
  } finally {
    await app.close();
  }
}

await seed();
