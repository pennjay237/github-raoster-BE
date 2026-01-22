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
        this.logger.log(`Starting roast generation for ${username}`);
        try {
            const githubData = await this.githubService.getUserData(username);
            const prompt = this.createRoastPrompt(githubData, temperature, customInstructions);
            const roast = await this.geminiService.generateRoast(prompt);
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Roast generation failed for ${username}:`, error);
            throw error;
        }
    }
    createRoastPrompt(data, temperature, customInstructions) {
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
};
exports.RoastService = RoastService;
exports.RoastService = RoastService = RoastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [github_service_1.GithubService,
        gemini_service_1.GeminiService])
], RoastService);
//# sourceMappingURL=roast.service.js.map