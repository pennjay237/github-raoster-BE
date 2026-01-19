"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    github: {
        apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
        token: process.env.GITHUB_TOKEN,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
    },
    security: {
        throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },
});
//# sourceMappingURL=app.config.js.map