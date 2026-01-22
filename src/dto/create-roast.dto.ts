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
} from 'class-validator';

export class CreateRoastDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(39)
  @Matches(/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/, {
    message: 'Invalid GitHub username format',
  })
  username: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  temperature?: number = 0.7;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  customInstructions?: string;
}