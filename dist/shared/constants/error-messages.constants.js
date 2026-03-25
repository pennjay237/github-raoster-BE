"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = void 0;
exports.ERROR_MESSAGES = {
    GITHUB: {
        USER_NOT_FOUND: 'GitHub user not found',
        RATE_LIMIT_EXCEEDED: 'GitHub API rate limit exceeded. Please try again later.',
        INVALID_USERNAME: 'Invalid GitHub username',
        API_ERROR: 'Failed to fetch data from GitHub',
    },
    OPENAI: {
        API_ERROR: 'Failed to generate roast with AI service',
        RATE_LIMIT_EXCEEDED: 'AI service rate limit exceeded',
        INVALID_REQUEST: 'Invalid request to AI service',
        CONTENT_FILTERED: 'Content was filtered by safety systems',
    },
    VALIDATION: {
        INVALID_USERNAME: 'Username must be a valid GitHub username (1-39 characters, letters, numbers, hyphens)',
        INVALID_TEMPERATURE: 'Temperature must be between 0.1 and 2.0',
        INVALID_INSTRUCTIONS: 'Custom instructions must be less than 200 characters',
    },
    AUTH: {
        API_KEY_REQUIRED: 'API key is required',
        INVALID_API_KEY: 'Invalid API key',
        UNAUTHORIZED: 'Unauthorized access',
    },
    RATE_LIMIT: {
        TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    },
    SERVER: {
        INTERNAL_ERROR: 'Internal server error',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    },
};
//# sourceMappingURL=error-messages.constants.js.map