export interface GitHubUser {
    username: string;
    name: string;
    bio: string;
    publicRepos: number;
    followers: number;
    following: number;
    accountAge: string;
    accountYears: number;
    createdAt: string;
    recentRepos: any[];
    languages: Record<string, number>;
    totalStars: number;
    totalForks: number;
    mostUsedLanguage: string;
    mostStarredRepo: string;
    repoActivity: string;
}
export interface RoastRequestData extends GitHubUser {
}
export interface RoastResponse {
    roast: string;
    data: GitHubUser;
    metadata: {
        generatedAt: string;
        model: string;
        temperature: number;
        disclaimer: string;
    };
}
