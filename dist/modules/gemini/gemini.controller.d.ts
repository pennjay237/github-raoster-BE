import { GeminiService } from './gemini.service';
export declare class GeminiController {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
    generate(prompt: string): Promise<{
        roast: string;
    }>;
}
