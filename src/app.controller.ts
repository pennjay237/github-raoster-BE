import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Returns welcome message' })
  getWelcome(): string {
    return this.appService.getWelcome();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Returns health status' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return this.appService.getHealth();
  }

  @Get('info')
  @ApiOperation({ summary: 'Service information' })
  @ApiResponse({ status: 200, description: 'Returns service information' })
  getInfo(): {
    name: string;
    version: string;
    description: string;
    environment: string;
  } {
    return this.appService.getInfo();
  }
}