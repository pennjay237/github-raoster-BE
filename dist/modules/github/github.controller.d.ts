import { GithubService } from './github.service';
export declare class GithubController {
    private readonly githubService;
    constructor(githubService: GithubService);
    getUser(username: string): Promise<any>;
}
