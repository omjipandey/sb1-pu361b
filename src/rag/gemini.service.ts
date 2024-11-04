import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: 'embedding-001',
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
    Context: ${context}
    
    Question: ${query}
    
    Please provide a detailed answer based on the context provided above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}