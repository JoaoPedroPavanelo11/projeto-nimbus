import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity.js';
import bcrypt from 'bcrypt';
import { userRole } from './user/enums/user.role.enums.js';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    try {
        const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;

        if (!ADMIN_EMAIL || !ADMIN_SENHA){
            throw new Error ('Defina ADMIN_EMAIL e ADMIN_SENHA no .env antes de rodar a seed!')
        }
        
        const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

        const existente = await userRepository.findOneBy({ email: ADMIN_EMAIL }); // vai procurar se existe algum email igual ao do admin email , caso nao achar devolve null

        if (existente) {
            console.log(`Admin ${ADMIN_EMAIL} ja existe, nada a fazer`);
            return;
        }

        const criarAdmin = userRepository.create({
            nome : ADMIN_NOME ?? 'Administrador',
            email : ADMIN_EMAIL,
            senha : await bcrypt.hash(ADMIN_SENHA, 10),
            role : userRole.ADMIN,
        })

        await userRepository.save(criarAdmin);
        console.log(`Admin ${ADMIN_EMAIL} criado com sucesso`)
        // O bloco acima cria o administrador 
    } finally {
        await app.close();
    }

}

await seed();