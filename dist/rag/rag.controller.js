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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const rag_service_1 = require("./rag.service");
const query_dto_1 = require("./dto/query.dto");
let RagController = class RagController {
    constructor(ragService) {
        this.ragService = ragService;
    }
    async ingestDocument(file) {
        const documents = await this.ragService.processPDF(file.path);
        await this.ragService.vectorizeAndStore(documents);
        return {
            message: 'Document processed successfully',
            chunks: documents.length,
        };
    }
    async queryDocuments(queryDto) {
        const answer = await this.ragService.queryDocuments(queryDto.query);
        return { answer };
    }
};
exports.RagController = RagController;
__decorate([
    (0, common_1.Post)('ingest'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RagController.prototype, "ingestDocument", null);
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.QueryDto]),
    __metadata("design:returntype", Promise)
], RagController.prototype, "queryDocuments", null);
exports.RagController = RagController = __decorate([
    (0, swagger_1.ApiTags)('RAG'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [rag_service_1.RagService])
], RagController);
//# sourceMappingURL=rag.controller.js.map