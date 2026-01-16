"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GeminiService_1.name);
        this.apiKey = this.configService.get('GEMINI_API_KEY') || '';
        this.baseUrl = this.configService.get('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta');
        this.model = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash-latest');
        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY is not configured. Mock mode enabled.');
        }
    }
    async generateRoast(prompt) {
        try {
            if (!this.apiKey) {
                this.logger.warn('Using mock Gemini response (no API key)');
                return this.getMockRoast();
            }
            this.logger.log(`Calling Gemini API with model: ${this.model}...`);
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
            const response = await axios_1.default.post(url, {
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 500,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!roast) {
                this.logger.warn('Gemini returned empty response');
                return this.getMockRoast();
            }
            this.logger.log('Roast generated successfully');
            return roast;
        }
        catch (error) {
            this.logger.error(`Gemini API error for model ${this.model}:`, error.response?.data || error.message);
            return this.tryFallbackModels(prompt);
        }
    }
    async tryFallbackModels(prompt) {
        const fallbackModels = [
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest',
            'gemini-1.0-pro-latest',
            'gemini-pro',
        ];
        for (const model of fallbackModels) {
            try {
                this.logger.log(`Trying fallback model: ${model}`);
                const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
                const response = await axios_1.default.post(url, {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 500,
                    },
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                });
                const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (roast) {
                    this.logger.log(`Success with model: ${model}`);
                    return roast;
                }
            }
            catch (error) {
                this.logger.warn(`Model ${model} failed: ${error.message}`);
            }
        }
        this.logger.warn('All Gemini models failed, using mock response');
        return this.getMockRoast();
    }
    getMockRoast() {
        return `🔥 GitHub Roast 🔥

Well well well, look who we have here! Another GitHub warrior braving the digital frontier. 

I see you've been committing code like it's going out of style... or maybe not enough? Either way, those repositories are looking mighty fine!

Your most used language? Let me guess... JavaScript, because who doesn't love a good callback hell? Or maybe Python, because indentation is life!

But seriously, keep up the good work! Every commit counts, even if it's just fixing that one typo you've been ignoring for months.

💻 Stay awesome, you coding legend!`;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map