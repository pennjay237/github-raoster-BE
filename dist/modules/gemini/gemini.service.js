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
        if (!this.apiKey && process.env.NODE_ENV === 'development') {
            this.logger.warn('GEMINI_API_KEY is not configured. Mock mode enabled.');
        }
    }
    async generateRoast(prompt) {
        try {
            if (!this.apiKey) {
                this.logger.warn('Using mock Gemini response (no API key)');
                return this.getMockRoast();
            }
            this.logger.log('Calling Gemini API...');
            const model = this.configService.get('GEMINI_MODEL', 'gemini-pro');
            const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
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
                return 'Even the AI couldn\'t find anything to roast about this perfect developer! 🌟';
            }
            this.logger.log('Roast generated successfully');
            return roast;
        }
        catch (error) {
            this.logger.error('Gemini API error:', error.response?.data || error.message);
            if (error.response?.data) {
                console.error('Gemini API Error Details:', error.response.data);
            }
            this.logger.warn('Falling back to mock response');
            return this.getMockRoast();
        }
    }
    getMockRoast() {
        return `🔥 GitHub Roast of User 🔥

Well well well, look who we have here! Another GitHub user trying to make their mark in the digital world. 

I see you've been on GitHub for a while, but your commit history looks more sporadic than my attempts at New Year's resolutions. Your most used language? Probably "procrastination" if we're being honest!

But hey, at least you're trying! Those repositories may not have many stars, but they're perfect for... well, for being repositories. And that bio? "Passionate developer" - how original! 

Remember: every great developer starts with a "Hello World" and a lot of confusion. Keep pushing those commits, even if they're just fixing typos in your README!

💻 Keep coding, you digital wizard!`;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map