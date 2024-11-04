import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { QueryDto } from './dto/query.dto';

@ApiTags('RAG')
@Controller('api')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async ingestDocument(@UploadedFile() file: Express.Multer.File) {
    const documents = await this.ragService.processPDF(file.path);
    await this.ragService.vectorizeAndStore(documents);
    return {
      message: 'Document processed successfully',
      chunks: documents.length,
    };
  }

  @Post('query')
  async queryDocuments(@Body() queryDto: QueryDto) {
    const answer = await this.ragService.queryDocuments(queryDto.query);
    return { answer };
  }
}