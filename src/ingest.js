import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import * as dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import { fileURLToPath } from 'url';

dotenv.config();

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

export async function processPDF(filePath) {
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

export async function vectorizeAndStore(documents) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'embedding-001',
    });

    console.log('Starting vectorization process...');
    progressBar.start(documents.length, 0);
    
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const vectors = await Promise.all(
            batch.map(async (doc) => {
                const embedding = await embeddings.embedQuery(doc.pageContent);
                return {
                    id: `doc${i}-${Date.now()}`,
                    values: embedding,
                    metadata: {
                        text: doc.pageContent,
                        source: doc.metadata.source,
                        page: doc.metadata.page,
                    },
                };
            })
        );
        
        await index.upsert(vectors);
        progressBar.update(i + batch.length);
    }
    
    progressBar.stop();
    console.log('\nVectorization completed successfully!');
}

// CLI interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const pdfPath = process.argv[2];
    if (!pdfPath) {
        console.error('Please provide a PDF file path');
        process.exit(1);
    }

    try {
        const documents = await processPDF(pdfPath);
        await vectorizeAndStore(documents);
    } catch (error) {
        console.error('Error processing document:', error);
    }
}