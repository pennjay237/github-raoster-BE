import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getWelcome(): string {
    return '🚀 GitHub Roast AI API - Ready to roast some GitHub profiles!';
  }

  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo(): {
    name: string;
    version: string;
    description: string;
    environment: string;
  } {
    return {
      name: 'GitHub Roast AI API',
      version: '1.0.0',
      description: 'AI-powered humorous roasts of GitHub users based on their coding activity',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }
}