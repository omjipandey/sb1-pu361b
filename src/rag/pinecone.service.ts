import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PineconeService {
  private pinecone: Pinecone;
  private index: any;

  constructor(private configService: ConfigService) {
    this.pinecone = new Pinecone({
      apiKey: this.configService.get<string>('PINECONE_API_KEY'),
      environment: this.configService.get<string>('PINECONE_ENVIRONMENT'),
    });
    this.index = this.pinecone.Index(
      this.configService.get<string>('PINECONE_INDEX_NAME'),
    );
  }

  async upsertVectors(vectors: any[]) {
    return this.index.upsert(vectors);
  }

  async query(queryEmbedding: number[]) {
    return this.index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });
  }
}