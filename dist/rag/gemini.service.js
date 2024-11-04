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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const google_genai_1 = require("@langchain/google-genai");
const config_1 = require("@nestjs/config");
let GeminiService = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey,
            modelName: 'embedding-001',
        });
    }
    async generateEmbedding(text) {
        return this.embeddings.embedQuery(text);
    }
    async generateResponse(query, context) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const prompt = `
    Context: ${context}
    
    Question: ${query}
    
    Please provide a detailed answer based on the context provided above.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map