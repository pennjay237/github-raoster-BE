export declare const ERROR_MESSAGES: {
    readonly GITHUB: {
        readonly USER_NOT_FOUND: "GitHub user not found";
        readonly RATE_LIMIT_EXCEEDED: "GitHub API rate limit exceeded. Please try again later.";
        readonly INVALID_USERNAME: "Invalid GitHub username";
        readonly API_ERROR: "Failed to fetch data from GitHub";
    };
    readonly OPENAI: {
        readonly API_ERROR: "Failed to generate roast with AI service";
        readonly RATE_LIMIT_EXCEEDED: "AI service rate limit exceeded";
        readonly INVALID_REQUEST: "Invalid request to AI service";
        readonly CONTENT_FILTERED: "Content was filtered by safety systems";
    };
    readonly VALIDATION: {
        readonly INVALID_USERNAME: "Username must be a valid GitHub username (1-39 characters, letters, numbers, hyphens)";
        readonly INVALID_TEMPERATURE: "Temperature must be between 0.1 and 2.0";
        readonly INVALID_INSTRUCTIONS: "Custom instructions must be less than 200 characters";
    };
    readonly AUTH: {
        readonly API_KEY_REQUIRED: "API key is required";
        readonly INVALID_API_KEY: "Invalid API key";
        readonly UNAUTHORIZED: "Unauthorized access";
    };
    readonly RATE_LIMIT: {
        readonly TOO_MANY_REQUESTS: "Too many requests. Please try again later.";
    };
    readonly SERVER: {
        readonly INTERNAL_ERROR: "Internal server error";
        readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable";
    };
};
