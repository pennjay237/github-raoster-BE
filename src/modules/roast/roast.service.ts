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
  ): Promise<any> {
    this.logger.log(` Starting roast generation for ${username} (temp: ${temperature})`);
    
    try {
      this.logger.log(` Fetching GitHub data for ${username}...`);
      const githubData = await this.githubService.getUserData(username);
      this.logger.log(`GitHub data fetched successfully`);
      
      const prompt = this.createRoastPrompt(githubData, temperature, customInstructions);
      this.logger.log(` Prompt created (${prompt.length} characters)`);
      
      this.logger.log(` Calling Gemini to generate roast...`);
      const roast = await this.geminiService.generateRoast(prompt, temperature);
      this.logger.log(` Roast generated successfully`);
      
      const response = {
        success: true,
        roast,
        data: githubData,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
          temperature,
          disclaimer: 'This roast is AI-generated and intended for entertainment only. All jokes are in good fun and focus on coding habits, not personal attributes.',
        },
      };
      
      this.logger.log(` Complete response prepared for ${username}`);
      return response;
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.error(` User not found: ${username}`);
        throw error;
      }
      this.logger.error(` Roast generation failed for ${username}:`, error);
      throw error;
    }
  }

  private createRoastPrompt(
    data: any, 
    temperature: number,
    customInstructions?: string
  ): string {
    const prompt = `You are a witty, sarcastic comedian who roasts developers based on their GitHub profiles. Create a hilarious roast that's clever and funny, but never mean-spirited.

 TARGET PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Username: @${data.username}
${data.name ? ` Name: ${data.name}` : ''}
${data.bio ? ` Bio: "${data.bio}"` : '📭 Bio: (No bio - mysterious!)'}
${data.location ? ` Location: ${data.location}` : ''}
${data.company ? ` Company: ${data.company}` : ''}

📊 GITHUB STATS:
-  Public Repos: ${data.publicRepos || 0}
-  Total Stars: ${data.totalStars || 0}
-  Followers: ${data.followers || 0} | Following: ${data.following || 0}
-  Account Age: ${data.accountYears || 0} years
-  Favorite Language: ${data.mostUsedLanguage || 'Unknown'}
-  Most Starred Repo: ${data.mostStarredRepo || 'None'}
-  Activity Level: ${data.repoActivity || 'Unknown'}
${data.email ? `•  Email: ${data.email}` : ''}
${data.blog ? `•  Blog: ${data.blog}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${customInstructions ? `\n SPECIAL INSTRUCTIONS: ${customInstructions}\n` : ''}

🎭 ROAST REQUIREMENTS:
1. **Be HILARIOUS** - Make it laugh-out-loud funny
2. **Be SPECIFIC** - Use their actual stats, repos, and activity
3. **Be CREATIVE** - Original jokes, not generic templates
4. **Developer Humor** - Programming jokes, commit puns, code references
5. **Playful Teasing** - Sarcastic but friendly, never mean
6. **Length**: 200-350 words
7. **Format**: Start with " **GitHub Roast of @${data.username}** 🔥"
8. **Ending**: Finish with an encouraging tech pun or witty closer

 NEVER MENTION: race, gender, age, religion, or any personal attributes

 Creativity Level: ${temperature}/2.0 ${temperature > 0.8 ? '(WILD MODE! )' : temperature > 0.5 ? '(Creative)' : '(Balanced)'}

Ready? Roast them! `;

    return prompt;
  }
}