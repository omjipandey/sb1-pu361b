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
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
const pdf_1 = require("langchain/document_loaders/fs/pdf");
const text_splitter_1 = require("langchain/text_splitter");
const pinecone_service_1 = require("./pinecone.service");
const gemini_service_1 = require("./gemini.service");
const cliProgress = require("cli-progress");
let RagService = class RagService {
    constructor(pineconeService, geminiService) {
        this.pineconeService = pineconeService;
        this.geminiService = geminiService;
        this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    }
    async processPDF(filePath) {
        console.log(`Loading PDF: ${filePath}`);
        const loader = new pdf_1.PDFLoader(filePath);
        const docs = await loader.load();
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(docs);
        console.log(`Split into ${splitDocs.length} chunks`);
        return splitDocs;
    }
    async vectorizeAndStore(documents) {
        console.log('Starting vectorization process...');
        this.progressBar.start(documents.length, 0);
        const batchSize = 100;
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            const vectors = await Promise.all(batch.map(async (doc) => {
                const embedding = await this.geminiService.generateEmbedding(doc.pageContent);
                return {
                    id: `doc${i}-${Date.now()}`,
                    values: embedding,
                    metadata: {
                        text: doc.pageContent,
                        source: doc.metadata.source,
                        page: doc.metadata.page,
                    },
                };
            }));
            await this.pineconeService.upsertVectors(vectors);
            this.progressBar.update(i + batch.length);
        }
        this.progressBar.stop();
        console.log('\nVectorization completed successfully!');
    }
    async queryDocuments(query) {
        const queryEmbedding = await this.geminiService.generateEmbedding(query);
        const searchResults = await this.pineconeService.query(queryEmbedding);
        const context = searchResults.matches
            .map((match) => match.metadata.text)
            .join('\n\n');
        return this.geminiService.generateResponse(query, context);
    }
};
exports.RagService = RagService;
exports.RagService = RagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pinecone_service_1.PineconeService,
        gemini_service_1.GeminiService])
], RagService);
//# sourceMappingURL=rag.service.js.map