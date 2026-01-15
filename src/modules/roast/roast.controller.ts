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
} from '@nestjs/common';
import { RoastService } from './roast.service';
import { CreateRoastDto } from '../../dto/create-roast.dto';

@Controller('roast')
export class RoastController {
  private readonly logger = new Logger(RoastController.name);

  constructor(private readonly roastService: RoastService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createRoast(@Body() createRoastDto: CreateRoastDto) {
    this.logger.log(`Received roast request for: ${createRoastDto.username}`);
    
    const result = await this.roastService.generateRoast(
      createRoastDto.username,
      createRoastDto.temperature,
      createRoastDto.customInstructions,
    );
    
    this.logger.log(`Successfully generated roast for: ${createRoastDto.username}`);
    return result;
  }

  @Get(':username')
  async getRoast(
    @Param('username') username: string,
    @Query('temperature') temperature: number = 0.7,
    @Query('customInstructions') customInstructions?: string,
  ) {
    this.logger.log(`GET roast request for: ${username}`);
    
    return this.roastService.generateRoast(
      username,
      temperature,
      customInstructions,
    );
  }
}