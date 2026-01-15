import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class GithubService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly githubToken;
    private readonly githubApiUrl;
    constructor(configService: ConfigService, httpService: HttpService);
    getUserData(username: string): Promise<any>;
    private getHeaders;
    private processGithubData;
    private determineRepoActivity;
}
