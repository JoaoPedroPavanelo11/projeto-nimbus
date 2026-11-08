import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET nao definido no .env - defina antes de iniciar a aplicacao');
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder() // Monta as informações gerais
  .setTitle('Nimbus API')
  .setDescription('API REST de chamados (help desk)')
  .setVersion('1.0')
  .addBearerAuth()
  .build(); // Entrega tudo pronto

  const document = SwaggerModule.createDocument(app, config); // Percorre todos os controller e gera a descrição commpelta da API
  SwaggerModule.setup('docs' , app, document);

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
