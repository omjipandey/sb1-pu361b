# RAG System with LangChain, Pinecone, and Gemini

This system implements a Retrieval Augmented Generation (RAG) using LangChain, Pinecone vector database, and Google's Gemini AI.

## Setup

1. Create a `.env` file with your API keys:

   ```
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   GEMINI_API_KEY=your_gemini_api_key
   PINECONE_INDEX_NAME=your_index_name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. To ingest and vectorize a PDF:

   ```bash
   node src/ingest.js path/to/your/document.pdf
   ```

2. To query the system:
   ```bash
   node src/index.js "Your question here"
   ```

## Features

- Handles large PDF files efficiently
- Chunks documents intelligently
- Shows progress during vectorization
- Optimized vector search
- Contextual responses using Gemini 1.5
- Batch processing for large documents
