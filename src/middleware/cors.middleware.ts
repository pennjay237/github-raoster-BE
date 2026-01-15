import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

export const corsMiddleware = (configService: ConfigService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
      'http://localhost:3000',
      'https://localhost:3000',
    ];

    const origin = req.headers.origin as string;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Api-Key',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  };
};