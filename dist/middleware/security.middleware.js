"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const securityMiddleware = () => {
    return (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('X-RateLimit-Limit', '10');
        res.setHeader('X-RateLimit-Remaining', '9');
        res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 60);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        next();
    };
};
exports.securityMiddleware = securityMiddleware;
//# sourceMappingURL=security.middleware.js.map