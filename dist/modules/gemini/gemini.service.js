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
                return this.getRandomMockRoast();
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
                return this.getRandomMockRoast();
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
        return this.getRandomMockRoast();
    }
    getRandomMockRoast() {
        const roasts = [
            `🔥 GitHub Roast 🔥

Look at you, Mr./Ms. GitHub! I see you've been busy... or maybe not busy enough? Your commit history has more gaps than my understanding of quantum physics!

I notice you're quite the language connoisseur - mastering the art of "Hello World" in 15 different programming languages. Truly impressive dedication!

But hey, at least your README files are impeccable. That's what really matters, right? Keep pushing those commits, you digital trailblazer! 💻

Remember: Every great developer started with a blank repository and a dream!`,
            `🔥 CODE CRITIQUE INCOMING 🔥

Well well well, if it isn't GitHub's newest rising star! Your repositories are so fresh, I can still smell the "git init" on them.

I see you've mastered the ancient art of "pushing to main" - truly a lost skill in these modern times of pull requests!

Your code might not have many stars yet, but those empty spaces in your commit calendar? They're shining brighter than the North Star!

Keep up the good work, you'll be a senior developer in no time... give or take a decade! 🚀`,
            `🔥 SENIOR DEV ROAST 🔥

Look at this seasoned GitHub veteran! You've been committing code since Git was just a baby!

Your repositories have more history than Wikipedia, and your commit messages are like ancient scrolls: "fix stuff" and "update things" - truly poetic!

I see you've stuck with the same tech stack since 2015. Consistency is key, they say... or is it stubbornness? Either way, respect!

Your code may be legacy, but your GitHub game is eternal! 👴💻`,
            `🔥 MINIMALIST MASTER 🔥

Ah, the minimalist approach to GitHub! You believe in quality over quantity... or maybe just quantity of zero?

Your profile is so clean, I could eat off it. Not a single unnecessary repository cluttering up the place!

That one "test-project" repo from 3 years ago? A masterpiece of restraint. Like a single brushstroke on a canvas!

They say less is more, and your GitHub proves it! 🎨`,
            `🔥 POLYGLOT PROGRAMMER 🔥

Look at this language collector! You've got more programming languages in your repos than I have in my Duolingo!

JavaScript, Python, Java, C++... you're like that person who learns "hello" in every language but can't order coffee in any of them!

But seriously, jack of all trades, master of... well, at least you're trying them all! That's what GitHub is for, right?

Keep exploring, you linguistic legend! 🌍💻`,
            `🔥 GHOST DEVELOPER ROAST 🔥

Hello? Is this account still active? *echoes*

Your last commit was so long ago, dinosaurs were still walking the Earth! Just kidding... or am I?

I see you're taking the "slow and steady" approach to software development. At this rate, you'll finish that TODO app by 2050!

But hey, absence makes the heart grow fonder! We'll be here when you return from your coding sabbatical! 🏖️💻`,
            `🔥 OVERACHIEVER ALERT 🔥

Whoa there, speed racer! Your commit graph looks like a seismograph during an earthquake!

Do you even sleep, or do you just dream in Git commands? "git commit -m 'fixed dreams'"

With this many repositories, you must be either:
1) A coding genius
2) Really good at forking
3) Both?

Slow down, buddy! Save some commits for the rest of us! 🏎️💨`,
            `🔥 README ROYALTY 🔥

Look at this documentation diva! Your README files are longer than War and Peace!

Complete with installation instructions, usage examples, CONTRIBUTING.md, CODE_OF_CONDUCT.md... you even documented how to document!

The code might be simple, but by golly, you'll know exactly how to run it in 15 different environments!

Documentation is love, documentation is life! 📚💖`,
            `🔥 FORK CONNOISSEUR 🔥

Ah, the art of the fork! You've turned GitHub's "Fork" button into your personal "Add to Collection" feature!

Your repositories are like a museum of other people's work - beautifully curated, lightly modified!

"Why write code when you can borrow it?" - Ancient GitHub Proverb, probably.

Keep collecting those forks, you digital archivist! 🍴🎨`,
            `🔥 ONE-REPO WONDER 🔥

Behold! The masterpiece! The one repository to rule them all!

You've poured your heart and soul into this single project... and then called it a day. Respect for knowing when you've peaked!

This repo has more commits than some companies have employees. It's not a project, it's a lifestyle!

Quality over quantity, am I right? 🎯`,
            `🔥 TEMPLATE TYCOON 🔥

Look at this template tycoon! You've got starter templates for everything:
- React template
- Node.js template  
- Python template
- "Future project" template
- "Template for templates" template

You're not just preparing for projects, you're preparing for the preparation of projects!

Organization level: Expert! 📁✨`,
            `🔥 ISSUE MAGNET 🔥

Oh dear, your issues tab is... lively! It's like a digital suggestion box that's overflowing!

"Feature Request: Everything"
"Bug: The whole thing"
"Enhancement: Make it better"

But hey, at least people are using your code! That's more than most can say!

Every issue is a sign of love, right? 🐛💝`,
            `🔥 STARGAZER SUPREME 🔥

Look at all those shiny stars! Your repositories are twinkling like the night sky!

You must be doing something right... or you just have really supportive friends and family!

Either way, congratulations on the digital validation! May your star count continue to rise!

Shine on, you crazy diamond! ⭐✨`,
            `🔥 SECRET AGENT 🔥

Mysterious! Enigmatic! All your best work is hidden away in private repositories!

What secrets are you keeping from us? The next big startup? World-changing algorithms? Or just... more "test" projects?

We may never know, but we respect your right to privacy!

The world may not see your code, but we know it's brilliant! 🕵️‍♂️💻`,
            `🔥 PERFECTLY BALANCED 🔥

As all things should be! Your GitHub is the epitome of balance:
- Some public repos, some private
- A few stars here and there  
- Regular but not obsessive commits
- Diverse but not scattered languages

You're like the Goldilocks of GitHub - not too hot, not too cold, just right!

The Zen master of version control! 🧘‍♂️⚖️`
        ];
        const randomIndex = Math.floor(Math.random() * roasts.length);
        this.logger.log(`Using mock roast #${randomIndex + 1}`);
        return roasts[randomIndex];
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map