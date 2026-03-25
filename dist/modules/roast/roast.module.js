"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoastModule = void 0;
const common_1 = require("@nestjs/common");
const roast_controller_1 = require("./roast.controller");
const roast_service_1 = require("./roast.service");
const github_module_1 = require("../github/github.module");
const gemini_module_1 = require("../gemini/gemini.module");
let RoastModule = class RoastModule {
};
exports.RoastModule = RoastModule;
exports.RoastModule = RoastModule = __decorate([
    (0, common_1.Module)({
        imports: [github_module_1.GithubModule, gemini_module_1.GeminiModule],
        controllers: [roast_controller_1.RoastController],
        providers: [roast_service_1.RoastService],
        exports: [roast_service_1.RoastService],
    })
], RoastModule);
//# sourceMappingURL=roast.module.js.map