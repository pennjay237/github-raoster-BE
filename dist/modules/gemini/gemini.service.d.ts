import { ConfigService } from '@nestjs/config';
export declare class GeminiService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    generateRoast(prompt: string): Promise<string>;
    private getMockRoast;
}
