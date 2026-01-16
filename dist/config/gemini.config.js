"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
        model: process.env.GEMINI_MODEL || 'models/gemini-2.0-flash-001',
        timeout: parseInt(process.env.GEMINI_TIMEOUT || '30000', 10),
    },
});
//# sourceMappingURL=gemini.config.js.map