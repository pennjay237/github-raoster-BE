declare const _default: () => {
    app: {
        name: string;
        version: string;
        port: number;
        nodeEnv: string;
        frontendUrl: string;
        enableSwagger: boolean;
    };
    github: {
        apiUrl: string;
        token: string | undefined;
    };
    security: {
        apiKey: string | undefined;
        throttleTtl: number;
        throttleLimit: number;
    };
};
export default _default;
