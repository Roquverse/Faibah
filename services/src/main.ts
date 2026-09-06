import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { execSync } from 'child_process';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    try {
      console.log('Running database migrations...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to run prisma db push', e);
    }
  }

  const app = await NestFactory.create(AppModule);
  
  // Security Headers
  app.use(helmet());
  
  // Input Validation & Sanitization
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      /\.railway\.app$/, // Allow Railway domains dynamically
      'https://faibah.com',
      'https://app.faibah.com',
      /\.faibah\.com$/,
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3005);
  console.log(`Backend server is running on port ${process.env.PORT ?? 3005}`);
}
bootstrap();
