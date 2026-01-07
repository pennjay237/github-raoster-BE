import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { RoastService } from './roast.service';
import { CreateRoastDto } from '../../dto/create-roast.dto';
import { ApiResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoastResponse } from '../../shared/types/github.types';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { TransformInterceptor } from '../../interceptors/transform.interceptor';

@ApiTags('roast')
@Controller('roast')
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class RoastController {
  private readonly logger = new Logger(RoastController.name);

  constructor(private readonly roastService: RoastService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate a humorous roast for a GitHub user',
    description: 'Fetches GitHub data and uses AI to generate a playful, developer-focused roast'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully generated roast',
    type: RoastResponse 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid username or request data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'GitHub user not found' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Rate limit exceeded' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async createRoast(@Body() createRoastDto: CreateRoastDto): Promise<RoastResponse> {
    this.logger.log(`Received roast request for: ${createRoastDto.username}`);
    
    const result = await this.roastService.generateRoast(
      createRoastDto.username,
      createRoastDto.temperature,
    );
    
    this.logger.log(`Successfully generated roast for: ${createRoastDto.username}`);
    return result;
  }
}