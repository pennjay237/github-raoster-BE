import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Query,
  HttpCode, 
  HttpStatus,
  Logger,
  Headers,  
} from '@nestjs/common';
import { RoastService } from './roast.service';
import { CreateRoastDto } from '../../dto/create-roast.dto';

@Controller('roast')
export class RoastController {
  private readonly logger = new Logger(RoastController.name);

  constructor(private readonly roastService: RoastService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createRoast(
    @Body() createRoastDto: CreateRoastDto,
    @Headers('x-user-api-key') userApiKey?: string,  // ✅ NEW
  ) {
    const apiKey = userApiKey || createRoastDto.userApiKey;
    
    this.logger.log(
      `POST roast request for: ${createRoastDto.username} ` +
      `(using ${apiKey ? 'user API key' : 'server API key'})`
    );
    
    const result = await this.roastService.generateRoast(
      createRoastDto.username,
      createRoastDto.temperature,
      createRoastDto.customInstructions,
      apiKey,  
    );
    
    this.logger.log(`Successfully generated roast for: ${createRoastDto.username}`);
    return result;
  }

  @Get(':username')
  async getRoast(
    @Param('username') username: string,
    @Query('temperature') temperature?: string,
    @Headers('x-user-api-key') userApiKey?: string,  
  ) {
    const temp = temperature ? parseFloat(temperature) : 0.7;
    const validTemp = isNaN(temp) ? 0.7 : Math.max(0.1, Math.min(2.0, temp));
    
    this.logger.log(
      `GET roast request for: ${username} ` +
      `(using ${userApiKey ? 'user API key' : 'server API key'})`
    );
    
    return this.roastService.generateRoast(
      username,
      validTemp,
      undefined,
      userApiKey,  
    );
  }
}