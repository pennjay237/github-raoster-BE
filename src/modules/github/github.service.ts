import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, timeout } from 'rxjs';
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
      // Fetch user data with timeout
      const userResponse = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${username}`, {
          headers: this.getHeaders(),
        }).pipe(
          timeout(10000), // 10 second timeout
          catchError((error: AxiosError) => {
            if (error.response?.status === 404) {
              throw new NotFoundException(`GitHub user '${username}' not found`);
            }
            
            // Check for timeout
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
              this.logger.warn(`GitHub API timeout for user ${username}, returning mock data`);
              throw new Error('TIMEOUT');
            }
            
            throw error;
          }),
        ),
      );

      // Fetch user repos with timeout
      const reposResponse = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${username}/repos`, {
          headers: this.getHeaders(),
          params: {
            sort: 'updated',
            direction: 'desc',
            per_page: 10,
          },
        }).pipe(
          timeout(10000), // 10 second timeout
          catchError((error: AxiosError) => {
            // For repos, we can continue with empty repos array
            this.logger.warn(`Failed to fetch repos for ${username}, using empty repos`);
            // Return mock empty repos
            return [{ data: [] }];
          }),
        ),
      );

      const userData = userResponse.data;
      const reposData = reposResponse.data || [];

      // Process data
      return this.processGithubData(userData, reposData);
    } catch (error: any) {
      // If timeout, return mock data
      if (error.message === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        this.logger.warn(`GitHub API timeout for ${username}, returning mock data`);
        return this.getMockGithubData(username);
      }
      
      // If not found, rethrow
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to fetch GitHub data for ${username}:`, error.message || error);
      
      // Return mock data for any other error
      return this.getMockGithubData(username);
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

  private getMockGithubData(username: string): any {
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    
    return {
      username: username,
      name: username,
      bio: 'Bio not available (using mock data)',
      publicRepos: 8,
      followers: 12,
      following: 5,
      createdAt: twoYearsAgo.toISOString(),
      accountYears: 2,
      recentRepos: [
        {
          name: 'sample-project',
          description: 'A sample project repository',
          language: 'JavaScript',
          stars: 5,
          forks: 2,
          updatedAt: now.toISOString(),
        },
        {
          name: 'learning-repo',
          description: 'Repository for learning new technologies',
          language: 'TypeScript',
          stars: 3,
          forks: 1,
          updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        }
      ],
      languages: { 'JavaScript': 4, 'TypeScript': 3, 'Python': 1 },
      totalStars: 15,
      totalForks: 8,
      mostUsedLanguage: 'JavaScript',
      mostStarredRepo: 'sample-project',
      repoActivity: 'somewhat active',
    };
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