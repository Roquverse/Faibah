import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
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
  
  // Ensure all companies have AI tokens set to 5 (capped at 5)
  try {
    const prisma = app.get(PrismaService);
    await prisma.company.updateMany({
      where: { aiTokens: { gt: 5 } },
      data: { aiTokens: 5 },
    });
    await prisma.company.updateMany({
      where: { aiTokens: { lt: 5 } },
      data: { aiTokens: 5 },
    });
  } catch (e) {
    console.error('Failed to update company tokens on startup:', e);
  }
  
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
