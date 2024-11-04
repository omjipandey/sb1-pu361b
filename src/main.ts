import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as ngrok from 'ngrok';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('RAG System API')
    .setDescription('API documentation for the RAG system using LangChain, Pinecone, and Gemini')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

  // Start ngrok tunnel if auth token is provided
  if (process.env.NGROK_AUTH_TOKEN) {
    try {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN,
      });
      console.log(`\nNgrok tunnel established:`);
      console.log(`Public URL: ${url}`);
      console.log(`Swagger documentation available at ${url}/api-docs`);
    } catch (error) {
      console.error('Error establishing ngrok tunnel:', error);
    }
  }
}

bootstrap();