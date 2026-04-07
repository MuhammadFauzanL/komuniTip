import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global API Response Formatter ───
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Global Validation Pipe ───
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus payload yang tidak terdaftar di DTO
      transform: true, // Otomatis transform payload ke instance DTO
      forbidNonWhitelisted: true, // Tolak payload dengan body nyasar
    }),
  );

  // ─── Swagger API Documentation ───
  const config = new DocumentBuilder()
    .setTitle('Komunitip API')
    .setDescription('API documentation for Komunitip donation & streaming platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
