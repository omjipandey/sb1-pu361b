import express from 'express';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { processPDF, vectorizeAndStore } from './ingest.js';
import { queryDocuments } from './index.js';
import * as dotenv from 'dotenv';
import ngrok from 'ngrok';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: 'uploads/' });
const app = express();

app.use(cors());
app.use(express.json());

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'RAG System API',
    version: '1.0.0',
    description: 'API documentation for the RAG system using LangChain, Pinecone, and Gemini'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  paths: {
    '/api/ingest': {
      post: {
        summary: 'Ingest and vectorize a PDF document',
        tags: ['Document Processing'],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF file to process'
                  }
                },
                required: ['file']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Document processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string'
                    },
                    chunks: {
                      type: 'number'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid input'
          },
          500: {
            description: 'Server error'
          }
        }
      }
    },
    '/api/query': {
      post: {
        summary: 'Query the RAG system',
        tags: ['Query'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The question to ask'
                  }
                },
                required: ['query']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Query response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    answer: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid input'
          },
          500: {
            description: 'Server error'
          }
        }
      }
    }
  }
};

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ingest endpoint
app.post('/api/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documents = await processPDF(req.file.path);
    await vectorizeAndStore(documents);

    res.json({
      message: 'Document processed successfully',
      chunks: documents.length
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document' });
  }
});

// Query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const answer = await queryDocuments(query);
    res.json({ answer });
  } catch (error) {
    console.error('Error querying documents:', error);
    res.status(500).json({ error: 'Error processing query' });
  }
});

const PORT = process.env.PORT || 3000;

// Start the server and ngrok tunnel
async function startServer() {
  try {
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Start ngrok tunnel if auth token is provided
    if (process.env.NGROK_AUTH_TOKEN) {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN
      });

      console.log(`\nNgrok tunnel established:`);
      console.log(`Public URL: ${url}`);
      console.log(`Swagger documentation available at ${url}/api-docs`);
    }
  } catch (error) {
    console.error('Error starting server or ngrok tunnel:', error);
    process.exit(1);
  }
}

startServer();