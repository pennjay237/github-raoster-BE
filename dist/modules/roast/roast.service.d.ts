import { GithubService } from '../github/github.service';
import { GeminiService } from '../gemini/gemini.service';
export declare class RoastService {
    private readonly githubService;
    private readonly geminiService;
    private readonly logger;
    constructor(githubService: GithubService, geminiService: GeminiService);
    generateRoast(username: string, temperature?: number, customInstructions?: string): Promise<any>;
    private createRoastPrompt;
}
