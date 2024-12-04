import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Chat Application API')
    .setDescription('Real-time chat application API documentation')
    .setVersion('1.0')
    .addTag('chat')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('app.port');
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap();