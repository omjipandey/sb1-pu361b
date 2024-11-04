import { ConfigService } from '@nestjs/config';
export declare class GeminiService {
    private configService;
    private genAI;
    private embeddings;
    constructor(configService: ConfigService);
    generateEmbedding(text: string): Promise<number[]>;
    generateResponse(query: string, context: string): Promise<string>;
}
