"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
    path.resolve(__dirname, '.env'),
];
for (const envPath of envPaths) {
    console.log(`Checking env file: ${envPath}`);
    if (fs.existsSync(envPath)) {
        console.log(`✅ Found .env at: ${envPath}`);
        dotenv.config({ path: envPath });
        break;
    }
}
console.log('PORT:', process.env.PORT);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`🔑 GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map