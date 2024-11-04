import { RagService } from './rag.service';
import { QueryDto } from './dto/query.dto';
export declare class RagController {
    private readonly ragService;
    constructor(ragService: RagService);
    ingestDocument(file: Express.Multer.File): Promise<{
        message: string;
        chunks: number;
    }>;
    queryDocuments(queryDto: QueryDto): Promise<{
        answer: string;
    }>;
}
