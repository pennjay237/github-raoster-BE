export default () => ({
  app: {
    name: process.env.APP_NAME || 'GitHub Roast AI',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  },
  github: {
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
    token: process.env.GITHUB_TOKEN,
  },
  security: {
    apiKey: process.env.API_KEY,
    throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
});