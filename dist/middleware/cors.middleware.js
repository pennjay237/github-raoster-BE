"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const corsMiddleware = (configService) => {
    return (req, res, next) => {
        const allowedOrigins = [
            configService.get('FRONTEND_URL', 'http://localhost:3000'),
            'http://localhost:3000',
            'https://localhost:3000',
        ];
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Api-Key');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    };
};
exports.corsMiddleware = corsMiddleware;
//# sourceMappingURL=cors.middleware.js.map