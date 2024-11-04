import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { PineconeService } from './pinecone.service';
import { GeminiService } from './gemini.service';

@Module({
  controllers: [RagController],
  providers: [RagService, PineconeService, GeminiService],
})
export class RagModule {}