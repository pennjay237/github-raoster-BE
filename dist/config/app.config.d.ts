declare const _default: () => {
    app: {
        port: number;
        nodeEnv: string;
        frontendUrl: string;
    };
    github: {
        apiUrl: string;
        token: string | undefined;
    };
    gemini: {
        apiKey: string | undefined;
        apiUrl: string;
        model: string;
    };
    security: {
        throttleTtl: number;
        throttleLimit: number;
    };
};
export default _default;
