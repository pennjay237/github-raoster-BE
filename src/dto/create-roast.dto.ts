import { 
  IsString, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsNumber, 
  Min, 
  Max,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoastDto {
  @ApiProperty({
    description: 'GitHub username to roast',
    example: 'octocat',
    minLength: 1,
    maxLength: 39,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(39)
  @Matches(/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/, {
    message: 'Invalid GitHub username format',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'Temperature for AI creativity (0.1 to 2.0)',
    example: 0.7,
    default: 0.7,
    minimum: 0.1,
    maximum: 2.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  temperature?: number = 0.7;

  @ApiPropertyOptional({
    description: 'Custom instructions for the roast',
    example: 'Focus on their TypeScript usage',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customInstructions?: string;
}