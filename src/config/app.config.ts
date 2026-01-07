import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiKey: process.env.API_KEY,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
}));