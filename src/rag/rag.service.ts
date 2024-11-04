import { Injectable } from '@nestjs/common';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeService } from './pinecone.service';
import { GeminiService } from './gemini.service';
import * as cliProgress from 'cli-progress';

@Injectable()
export class RagService {
  private progressBar: any;

  constructor(
    private readonly pineconeService: PineconeService,
    private readonly geminiService: GeminiService,
  ) {
    this.progressBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic,
    );
  }

  async processPDF(filePath: string) {
    console.log(`Loading PDF: ${filePath}`);
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);
    return splitDocs;
  }

  async vectorizeAndStore(documents: any[]) {
    console.log('Starting vectorization process...');
    this.progressBar.start(documents.length, 0);

    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const vectors = await Promise.all(
        batch.map(async (doc) => {
          const embedding = await this.geminiService.generateEmbedding(
            doc.pageContent,
          );
          return {
            id: `doc${i}-${Date.now()}`,
            values: embedding,
            metadata: {
              text: doc.pageContent,
              source: doc.metadata.source,
              page: doc.metadata.page,
            },
          };
        }),
      );

      await this.pineconeService.upsertVectors(vectors);
      this.progressBar.update(i + batch.length);
    }

    this.progressBar.stop();
    console.log('\nVectorization completed successfully!');
  }

  async queryDocuments(query: string): Promise<string> {
    const queryEmbedding = await this.geminiService.generateEmbedding(query);
    const searchResults = await this.pineconeService.query(queryEmbedding);

    const context = searchResults.matches
      .map((match) => match.metadata.text)
      .join('\n\n');

    return this.geminiService.generateResponse(query, context);
  }
}