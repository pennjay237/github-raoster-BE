"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RoastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoastService = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("../github/github.service");
const gemini_service_1 = require("../gemini/gemini.service");
let RoastService = RoastService_1 = class RoastService {
    constructor(githubService, geminiService) {
        this.githubService = githubService;
        this.geminiService = geminiService;
        this.logger = new common_1.Logger(RoastService_1.name);
    }
    async generateRoast(username, temperature = 0.7, customInstructions) {
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.error(` User not found: ${username}`);
                throw error;
            }
            this.logger.error(` Roast generation failed for ${username}:`, error);
            throw error;
        }
    }
    createRoastPrompt(data, temperature, customInstructions) {
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
};
exports.RoastService = RoastService;
exports.RoastService = RoastService = RoastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [github_service_1.GithubService,
        gemini_service_1.GeminiService])
], RoastService);
//# sourceMappingURL=roast.service.js.map