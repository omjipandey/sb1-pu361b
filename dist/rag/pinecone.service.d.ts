import { ConfigService } from '@nestjs/config';
export declare class PineconeService {
    private configService;
    private pinecone;
    private index;
    constructor(configService: ConfigService);
    upsertVectors(vectors: any[]): Promise<any>;
    query(queryEmbedding: number[]): Promise<any>;
}
