import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GithubService } from '../github/github.service'; // Changed from GitHubService
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class RoastService {
  private readonly logger = new Logger(RoastService.name);

  constructor(
    private readonly githubService: GithubService, // Changed
    private readonly geminiService: GeminiService,
  ) {}

  async generateRoast(
    username: string,
    temperature: number = 0.7,
    customInstructions?: string,
  ): Promise<any> {
    this.logger.log(`Starting roast generation for ${username}`);
    
    try {
      // 1. Fetch GitHub data
      const githubData = await this.githubService.getUserData(username);
      
      // 2. Generate prompt for Gemini
      const prompt = this.createRoastPrompt(githubData, temperature, customInstructions);
      
      // 3. Generate roast with Gemini
      const roast = await this.geminiService.generateRoast(prompt);
      
      // 4. Construct response
      return {
        roast,
        data: githubData,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: process.env.GEMINI_MODEL || 'gemini-pro',
          temperature,
          disclaimer: 'This roast is AI-generated and intended for entertainment only. All jokes are in good fun and focus on coding habits, not personal attributes.',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Roast generation failed for ${username}:`, error);
      throw error;
    }
  }

  private createRoastPrompt(
    data: any, 
    temperature: number,
    customInstructions?: string
  ): string {
    return `
      Create a funny, lighthearted roast of a GitHub user based on their profile data.
      
      USER PROFILE:
      - Username: ${data.username} (${data.name})
      - Bio: ${data.bio}
      - ${data.followers} followers, following ${data.following}
      - ${data.publicRepos} public repositories
      - GitHub member for ${data.accountYears} years
      - Most used language: ${data.mostUsedLanguage}
      - Most starred repo: ${data.mostStarredRepo}
      - Repository activity: ${data.repoActivity}
      ${customInstructions ? `- Custom instructions: ${customInstructions}` : ''}
      
      ROAST GUIDELINES:
      1. Be humorous but respectful - no personal attacks
      2. Focus on coding habits, commit patterns, and GitHub activity
      3. Use programming jokes and developer humor
      4. Keep it between 150-300 words
      5. Never mention race, gender, age, or other personal attributes
      6. End with a playful programming pun or encouragement
      7. Make it specific to their GitHub stats
      
      Tone: Playful sarcasm, friendly teasing, witty observations
      Creativity level: ${temperature} (0.1=conservative, 1.0=creative)
      
      Format: Start with "🔥 GitHub Roast of ${data.username} 🔥"
      
      IMPORTANT: The response should ONLY contain the roast text, no additional explanations.
    `;
  }
}