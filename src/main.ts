import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Debug: Show current directory
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Try to load .env from different locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '.env'),
];

for (const envPath of envPaths) {
  console.log(`Checking env file: ${envPath}`);
  if (fs.existsSync(envPath)) {
    console.log(`✅ Found .env at: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

// Check if environment variables are loaded
console.log('PORT:', process.env.PORT);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`🔑 GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
}

bootstrap();