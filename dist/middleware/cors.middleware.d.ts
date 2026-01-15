import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
export declare const corsMiddleware: (configService: ConfigService) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
