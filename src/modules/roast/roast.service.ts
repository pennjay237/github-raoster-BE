import { Injectable, Logger } from '@nestjs/common';
import { GitHubService } from '../github/github.service';
import { OpenAIService } from '../openai/openai.service';
import { RoastResponse, RoastRequestData } from '../../shared/types/github.types';

@Injectable()
export class RoastService {
  private readonly logger = new Logger(RoastService.name);

  constructor(
    private readonly githubService: GitHubService,
    private readonly openaiService: OpenAIService,
  ) {}

  async generateRoast(
    username: string,
    temperature: number = 0.7,
  ): Promise<RoastResponse> {
    this.logger.log(`Starting roast generation for ${username}`);
    
    // 1. Fetch GitHub data
    const githubData = await this.githubService.getUserData(username);
    
    // 2. Prepare roast data
    const roastData = this.prepareRoastData(githubData);
    
    // 3. Generate roast with OpenAI
    const roast = await this.openaiService.generateRoast(roastData, temperature);
    
    // 4. Construct response
    return {
      roast,
      data: githubData,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        temperature,
        disclaimer: 'This roast is AI-generated and intended for entertainment only. All jokes are in good fun and focus on coding habits, not personal attributes.',
      },
    };
  }

  private prepareRoastData(data: any): RoastRequestData {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return {
      username: data.username,
      name: data.name,
      bio: data.bio,
      publicRepos: data.publicRepos,
      followers: data.followers,
      following: data.following,
      accountAge: data.accountAge,
      accountYears: data.accountYears,
      createdAt: data.createdAt,
      recentRepos: data.recentRepos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        daysSinceUpdate: Math.floor(
          (now.getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
      languages: data.languages,
      totalStars: data.totalStars,
      totalForks: data.totalForks,
      mostUsedLanguage: data.mostUsedLanguage,
      mostStarredRepo: data.mostStarredRepo,
      repoActivity: data.repoActivity,
    };
  }
}