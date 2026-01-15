import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly githubToken: string;
  private readonly githubApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN', '');
    this.githubApiUrl = this.configService.get<string>('GITHUB_API_URL', 'https://api.github.com');
  }

  async getUserData(username: string): Promise<any> {
    this.logger.log(`Fetching GitHub data for: ${username}`);
    
    try {
      // Fetch user data
      const userResponse = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${username}`, {
          headers: this.getHeaders(),
        }).pipe(
          catchError((error: AxiosError) => {
            if (error.response?.status === 404) {
              throw new NotFoundException(`GitHub user '${username}' not found`);
            }
            throw error;
          }),
        ),
      );

      // Fetch user repos
      const reposResponse = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${username}/repos`, {
          headers: this.getHeaders(),
          params: {
            sort: 'updated',
            direction: 'desc',
            per_page: 10,
          },
        }),
      );

      const userData = userResponse.data;
      const reposData = reposResponse.data;

      // Process data
      return this.processGithubData(userData, reposData);
    } catch (error) {
      this.logger.error(`Failed to fetch GitHub data for ${username}:`, error);
      throw error;
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Roast-AI-App',
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    return headers;
  }

  private processGithubData(userData: any, reposData: any[]): any {
    // Calculate account years
    const createdAt = new Date(userData.created_at);
    const now = new Date();
    const accountYears = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    );

    // Analyze languages
    const languages: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    reposData.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    });

    // Find most used language
    let mostUsedLanguage = 'Unknown';
    if (Object.keys(languages).length > 0) {
      mostUsedLanguage = Object.keys(languages).reduce((a, b) => 
        languages[a] > languages[b] ? a : b, 
        Object.keys(languages)[0]
      );
    }

    // Find most starred repo
    let mostStarredRepoName = 'None';
    if (reposData.length > 0) {
      const mostStarredRepo = reposData.reduce((a, b) => 
        (a.stargazers_count || 0) > (b.stargazers_count || 0) ? a : b,
        reposData[0]
      );
      mostStarredRepoName = mostStarredRepo.name;
    }

    return {
      username: userData.login,
      name: userData.name || userData.login,
      bio: userData.bio || 'No bio available',
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      createdAt: userData.created_at,
      accountYears,
      recentRepos: reposData.slice(0, 5).map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        updatedAt: repo.updated_at,
      })),
      languages,
      totalStars,
      totalForks,
      mostUsedLanguage,
      mostStarredRepo: mostStarredRepoName,
      repoActivity: this.determineRepoActivity(reposData),
    };
  }

  private determineRepoActivity(reposData: any[]): string {
    if (!reposData || reposData.length === 0) return 'inactive';
    
    const now = new Date();
    const lastUpdate = new Date(reposData[0]?.updated_at || now);
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24),
    );
    
    if (daysSinceUpdate < 7) return 'very active';
    if (daysSinceUpdate < 30) return 'active';
    if (daysSinceUpdate < 90) return 'somewhat active';
    return 'inactive';
  }
}