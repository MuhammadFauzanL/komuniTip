import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  // ─── Validate Critical Environment Variables ───
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ FATAL: Environment variable ${envVar} is not set. Server cannot start.`);
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule);
  
  // ─── Global API Prefix ───
  app.setGlobalPrefix('api');


  const allowedOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // ─── CORS Configuration ───
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // ─── Security Configuration ─── 
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  }));

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
