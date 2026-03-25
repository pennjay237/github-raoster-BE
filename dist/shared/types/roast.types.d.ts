export interface PromptTemplate {
    system: string;
    user: (data: any) => string;
}
export interface OpenAIConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
}
export interface RateLimitConfig {
    ttl: number;
    limit: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}
