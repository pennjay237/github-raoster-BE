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
        this.model = this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash-001');
        if (!this.apiKey) {
            this.logger.warn(' GEMINI_API_KEY is not configured. Gemini API calls will fail.');
        }
        else {
            this.logger.log(` Gemini Service initialized with model: ${this.model}`);
            this.logger.log(` API Key loaded: ${this.apiKey.substring(0, 20)}...`);
        }
    }
    async generateRoast(prompt, temperature = 0.7) {
        try {
            if (!this.apiKey) {
                this.logger.error(' GEMINI_API_KEY is not configured');
                throw new common_1.InternalServerErrorException('Gemini API key is not configured');
            }
            this.logger.log(` Calling Gemini API with model: ${this.model}, temperature: ${temperature}`);
            const modelName = this.model.startsWith('models/')
                ? this.model.replace('models/', '')
                : this.model;
            const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
            const requestBody = {
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: temperature,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 8192,
                    candidateCount: 1,
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
            };
            this.logger.debug(' Request URL:', url);
            const response = await axios_1.default.post(url, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            this.logger.debug(' Response:', JSON.stringify(response.data, null, 2));
            const roast = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!roast) {
                this.logger.error(' Gemini returned empty response');
                throw new common_1.InternalServerErrorException('Gemini API returned empty response');
            }
            this.logger.log(` Roast generated successfully (${roast.length} characters)`);
            return roast.trim();
        }
        catch (error) {
            this.logger.error(` Gemini API error:`, {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response?.status === 404) {
                throw new common_1.InternalServerErrorException(`Invalid Gemini model: ${this.model}. Please check available models.`);
            }
            if (error.response?.status === 403) {
                throw new common_1.InternalServerErrorException('Gemini API key is invalid or expired.');
            }
            if (error.response?.status === 429) {
                throw new common_1.InternalServerErrorException('Gemini API rate limit exceeded. Please try again later.');
            }
            throw new common_1.InternalServerErrorException(`Failed to generate roast: ${error.message}`);
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map