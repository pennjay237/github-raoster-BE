import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GithubService } from '../github/github.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class RoastService {
  private readonly logger = new Logger(RoastService.name);

  constructor(
    private readonly githubService: GithubService, 
    private readonly geminiService: GeminiService,
  ) {}

  async generateRoast(
    username: string,
    temperature: number = 0.7,
    customInstructions?: string,
    userApiKey?: string, 
  ): Promise<any> {
    this.logger.log(`🎯 Starting roast generation for ${username} (temp: ${temperature})`);
    
    try {
      this.logger.log(`📊 Fetching GitHub data for ${username}...`);
      const githubData = await this.githubService.getUserData(username);
      this.logger.log(`✅ GitHub data fetched successfully`);
      
      const prompt = this.createRoastPrompt(githubData, temperature, customInstructions);
      this.logger.log(`📝 Prompt created (${prompt.length} characters)`);
      
      this.logger.log(`🤖 Calling Gemini to generate roast...`);
      const roast = await this.geminiService.generateRoast(
        prompt, 
        temperature,
        userApiKey,  
      );
      this.logger.log(`✅ Roast generated successfully`);
      
      const response = {
        success: true,
        roast,
        data: githubData,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          temperature,
          usingUserApiKey: !!userApiKey, 
          disclaimer: 'This roast is AI-generated and intended for entertainment only. All jokes are in good fun and focus on coding habits, not personal attributes.',
        },
      };
      
      this.logger.log(`🎉 Complete response prepared for ${username}`);
      return response;
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.error(`❌ User not found: ${username}`);
        throw error;
      }
      this.logger.error(`❌ Roast generation failed for ${username}:`, error);
      throw error;
    }
  }

  private createRoastPrompt(
    data: any, 
    temperature: number,
    customInstructions?: string
  ): string {
    const prompt = `You are a witty stand-up comedian roasting a developer's GitHub profile.

TARGET:
- Username: @${data.username}
- Name: ${data.name || data.username}
- Bio: ${data.bio && !data.bio.toLowerCase().includes('mock') ? data.bio : 'No bio'}
- Public Repos: ${data.publicRepos || 0}
- Total Stars: ${data.totalStars || 0}
- Followers: ${data.followers || 0}
- Following: ${data.following || 0}
- Account Age: ${data.accountYears || 0} years
- Favorite Language: ${data.mostUsedLanguage || 'Unknown'}
- Most Starred Repo: ${data.mostStarredRepo || 'None'}
- Activity Level: ${data.repoActivity || 'Unknown'}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ''}

STRICT RULES:
1. Write ONLY the roast text - no titles, no headers, no "GitHub Roast of @username"
2. NO markdown symbols like **, *, ##, or __
3. NO backtick code formatting like git push or console.log
4. NO mock data references or placeholder mentions
5. Keep it between 150-250 words maximum
6. Use plain conversational English
7. Be funny, sarcastic, and developer-focused
8. End with ONE short encouraging sentence
9. NO emojis except at the very start and very end

FORMAT: Start directly with the roast. Example:
"So @username walks into a code review..."

Creativity level: ${temperature}/2.0`;

    return prompt;
  }
}