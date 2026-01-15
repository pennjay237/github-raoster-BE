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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GitHubUserDto {
}
exports.GitHubUserDto = GitHubUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GitHub username',
        example: 'octocat',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "login", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GitHub user ID',
        example: 583231,
    }),
    __metadata("design:type", Number)
], GitHubUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Avatar URL',
        example: 'https://avatars.githubusercontent.com/u/583231?v=4',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "avatar_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GitHub profile URL',
        example: 'https://github.com/octocat',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "html_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Full name',
        example: 'The Octocat',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User bio',
        example: 'A mysterious octocat',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Company',
        example: 'GitHub',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Blog URL',
        example: 'https://github.blog',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "blog", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Location',
        example: 'San Francisco',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email address',
        example: 'octocat@github.com',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of public repositories',
        example: 8,
    }),
    __metadata("design:type", Number)
], GitHubUserDto.prototype, "public_repos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of followers',
        example: 1000,
    }),
    __metadata("design:type", Number)
], GitHubUserDto.prototype, "followers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of following',
        example: 9,
    }),
    __metadata("design:type", Number)
], GitHubUserDto.prototype, "following", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account creation date',
        example: '2011-01-25T18:44:36Z',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2023-10-05T14:21:12Z',
    }),
    __metadata("design:type", String)
], GitHubUserDto.prototype, "updated_at", void 0);
//# sourceMappingURL=github-user.dto.js.map