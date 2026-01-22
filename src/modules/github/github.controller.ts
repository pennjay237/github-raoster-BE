import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('user/:username')
  async getUser(@Param('username') username: string) {
    return this.githubService.getUserData(username);
  }
}