import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GitHubUserDto {
  @ApiProperty({
    description: 'GitHub username',
    example: 'octocat',
  })
  login: string;

  @ApiProperty({
    description: 'GitHub user ID',
    example: 583231,
  })
  id: number;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://avatars.githubusercontent.com/u/583231?v=4',
  })
  avatar_url: string;

  @ApiProperty({
    description: 'GitHub profile URL',
    example: 'https://github.com/octocat',
  })
  html_url: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'The Octocat',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'A mysterious octocat',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Company',
    example: 'GitHub',
  })
  company?: string;

  @ApiPropertyOptional({
    description: 'Blog URL',
    example: 'https://github.blog',
  })
  blog?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'San Francisco',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'octocat@github.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Number of public repositories',
    example: 8,
  })
  public_repos: number;

  @ApiProperty({
    description: 'Number of followers',
    example: 1000,
  })
  followers: number;

  @ApiProperty({
    description: 'Number of following',
    example: 9,
  })
  following: number;

  @ApiProperty({
    description: 'Account creation date',
    example: '2011-01-25T18:44:36Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-10-05T14:21:12Z',
  })
  updated_at: string;
}