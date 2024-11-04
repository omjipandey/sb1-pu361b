import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    description: 'The question to ask the RAG system',
    example: 'What are the key points discussed in the document?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}