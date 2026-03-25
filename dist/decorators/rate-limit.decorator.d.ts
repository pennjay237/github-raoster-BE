export declare const RATE_LIMIT_KEY = "rateLimit";
export interface RateLimitOptions {
    ttl?: number;
    limit?: number;
}
export declare const RateLimit: (options?: RateLimitOptions) => import("@nestjs/common").CustomDecorator<string>;
