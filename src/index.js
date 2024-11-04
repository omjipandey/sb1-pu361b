import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function queryDocuments(query) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'embedding-001',
    });

    const queryEmbedding = await embeddings.embedQuery(query);

    const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
    });

    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join('\n\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
    Context: ${context}
    
    Question: ${query}
    
    Please provide a detailed answer based on the context provided above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// CLI interface
if (process.argv[2]) {
    const query = process.argv[2];
    try {
        const answer = await queryDocuments(query);
        console.log('\nAnswer:', answer);
    } catch (error) {
        console.error('Error querying documents:', error);
    }
}