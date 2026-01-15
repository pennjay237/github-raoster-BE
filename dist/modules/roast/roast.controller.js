"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RoastController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoastController = void 0;
const common_1 = require("@nestjs/common");
const roast_service_1 = require("./roast.service");
const create_roast_dto_1 = require("../../dto/create-roast.dto");
let RoastController = RoastController_1 = class RoastController {
    constructor(roastService) {
        this.roastService = roastService;
        this.logger = new common_1.Logger(RoastController_1.name);
    }
    async createRoast(createRoastDto) {
        this.logger.log(`Received roast request for: ${createRoastDto.username}`);
        const result = await this.roastService.generateRoast(createRoastDto.username, createRoastDto.temperature, createRoastDto.customInstructions);
        this.logger.log(`Successfully generated roast for: ${createRoastDto.username}`);
        return result;
    }
    async getRoast(username, temperature = 0.7, customInstructions) {
        this.logger.log(`GET roast request for: ${username}`);
        return this.roastService.generateRoast(username, temperature, customInstructions);
    }
};
exports.RoastController = RoastController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_roast_dto_1.CreateRoastDto]),
    __metadata("design:returntype", Promise)
], RoastController.prototype, "createRoast", null);
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Query)('temperature')),
    __param(2, (0, common_1.Query)('customInstructions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], RoastController.prototype, "getRoast", null);
exports.RoastController = RoastController = RoastController_1 = __decorate([
    (0, common_1.Controller)('roast'),
    __metadata("design:paramtypes", [roast_service_1.RoastService])
], RoastController);
//# sourceMappingURL=roast.controller.js.map