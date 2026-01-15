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
var GithubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let GithubService = GithubService_1 = class GithubService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(GithubService_1.name);
        this.githubToken = this.configService.get('GITHUB_TOKEN', '');
        this.githubApiUrl = this.configService.get('GITHUB_API_URL', 'https://api.github.com');
    }
    async getUserData(username) {
        this.logger.log(`Fetching GitHub data for: ${username}`);
        try {
            const userResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.githubApiUrl}/users/${username}`, {
                headers: this.getHeaders(),
            }).pipe((0, rxjs_1.catchError)((error) => {
                if (error.response?.status === 404) {
                    throw new common_1.NotFoundException(`GitHub user '${username}' not found`);
                }
                throw error;
            })));
            const reposResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.githubApiUrl}/users/${username}/repos`, {
                headers: this.getHeaders(),
                params: {
                    sort: 'updated',
                    direction: 'desc',
                    per_page: 10,
                },
            }));
            const userData = userResponse.data;
            const reposData = reposResponse.data;
            return this.processGithubData(userData, reposData);
        }
        catch (error) {
            this.logger.error(`Failed to fetch GitHub data for ${username}:`, error);
            throw error;
        }
    }
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Roast-AI-App',
        };
        if (this.githubToken) {
            headers['Authorization'] = `token ${this.githubToken}`;
        }
        return headers;
    }
    processGithubData(userData, reposData) {
        const createdAt = new Date(userData.created_at);
        const now = new Date();
        const accountYears = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        const languages = {};
        let totalStars = 0;
        let totalForks = 0;
        reposData.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count || 0;
            totalForks += repo.forks_count || 0;
        });
        let mostUsedLanguage = 'Unknown';
        if (Object.keys(languages).length > 0) {
            mostUsedLanguage = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b, Object.keys(languages)[0]);
        }
        let mostStarredRepoName = 'None';
        if (reposData.length > 0) {
            const mostStarredRepo = reposData.reduce((a, b) => (a.stargazers_count || 0) > (b.stargazers_count || 0) ? a : b, reposData[0]);
            mostStarredRepoName = mostStarredRepo.name;
        }
        return {
            username: userData.login,
            name: userData.name || userData.login,
            bio: userData.bio || 'No bio available',
            publicRepos: userData.public_repos || 0,
            followers: userData.followers || 0,
            following: userData.following || 0,
            createdAt: userData.created_at,
            accountYears,
            recentRepos: reposData.slice(0, 5).map(repo => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                updatedAt: repo.updated_at,
            })),
            languages,
            totalStars,
            totalForks,
            mostUsedLanguage,
            mostStarredRepo: mostStarredRepoName,
            repoActivity: this.determineRepoActivity(reposData),
        };
    }
    determineRepoActivity(reposData) {
        if (!reposData || reposData.length === 0)
            return 'inactive';
        const now = new Date();
        const lastUpdate = new Date(reposData[0]?.updated_at || now);
        const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate < 7)
            return 'very active';
        if (daysSinceUpdate < 30)
            return 'active';
        if (daysSinceUpdate < 90)
            return 'somewhat active';
        return 'inactive';
    }
};
exports.GithubService = GithubService;
exports.GithubService = GithubService = GithubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], GithubService);
//# sourceMappingURL=github.service.js.map