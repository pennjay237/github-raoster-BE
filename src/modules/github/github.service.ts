import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GitHubUser, GitHubRepo, GitHubData } from '../../shared/types/github.types';
import * as dateUtils from '../../shared/utils/date.utils';

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly githubApi = 'https://api.github.com';
  
  constructor(private readonly configService: ConfigService) {}

  async getUserData(username: string): Promise<GitHubData> {
    try {
      this.logger.log(`Fetching GitHub data for user: ${username}`);
      
      const [userResponse, reposResponse] = await Promise.all([
        this.fetchGitHubUser(username),
        this.fetchUserRepositories(username),
      ]);

      const user = userResponse.data;
      const repos = reposResponse.data;

      return this.transformGitHubData(user, repos);
    } catch (error) {
      this.logger.error(`Failed to fetch GitHub data: ${error.message}`);
      
      if (error.response?.status === 404) {
        throw new HttpException(
          `GitHub user "${username}" not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (error.response?.status === 403) {
        throw new HttpException(
          'GitHub API rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      
      throw new HttpException(
        'Failed to fetch GitHub data. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchGitHubUser(username: string) {
    return axios.get<GitHubUser>(`${this.githubApi}/users/${username}`, {
      headers: this.getHeaders(),
      timeout: 10000,
    });
  }

  private async fetchUserRepositories(username: string) {
    return axios.get<GitHubRepo[]>(`${this.githubApi}/users/${username}/repos`, {
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 10,
        page: 1,
      },
      headers: this.getHeaders(),
      timeout: 15000,
    });
  }

  private getHeaders() {
    return {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Roast-AI/1.0.0',
      'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
    };
  }

  private transformGitHubData(user: GitHubUser, repos: GitHubRepo[]): GitHubData {
    const accountAge = dateUtils.calculateAccountAge(user.created_at);
    const accountYears = dateUtils.calculateYearsSince(user.created_at);
    
    // Analyze languages
    const languages: Record<string, number> = {};
    const recentRepos = repos.slice(0, 5);
    
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Calculate totals
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Find most used language
    const mostUsedLanguage = Object.keys(languages).reduce((a, b) => 
      languages[a] > languages[b] ? a : b, null
    );
    
    // Find most starred repo
    const mostStarredRepo = repos.length > 0 
      ? repos.reduce((max, repo) => 
          repo.stargazers_count > max.stars 
            ? { name: repo.name, stars: repo.stargazers_count }
            : max, 
          { name: repos[0].name, stars: repos[0].stargazers_count }
        )
      : null;
    
    // Calculate repo activity (updated in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const activeRepos = repos.filter(repo => 
      new Date(repo.updated_at) > sixMonthsAgo
    ).length;
    
    const repoActivity = {
      active: activeRepos,
      inactive: repos.length - activeRepos,
    };

    return {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      followers: user.followers,
      following: user.following,
      accountAge,
      accountYears,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      recentRepos,
      languages,
      totalStars,
      totalForks,
      mostUsedLanguage,
      mostStarredRepo,
      repoActivity,
    };
  }
}