import { ConfigService } from '@nestjs/config';
export declare class GeminiService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly model;
    constructor(configService: ConfigService);
    generateRoast(prompt: string): Promise<string>;
    private tryFallbackModels;
    private getRandomMockRoast;
}
