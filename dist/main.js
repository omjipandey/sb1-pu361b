"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const ngrok = require("ngrok");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('RAG System API')
        .setDescription('API documentation for the RAG system using LangChain, Pinecone, and Gemini')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    if (process.env.NGROK_AUTH_TOKEN) {
        try {
            const url = await ngrok.connect({
                addr: PORT,
                authtoken: process.env.NGROK_AUTH_TOKEN,
            });
            console.log(`\nNgrok tunnel established:`);
            console.log(`Public URL: ${url}`);
            console.log(`Swagger documentation available at ${url}/api-docs`);
        }
        catch (error) {
            console.error('Error establishing ngrok tunnel:', error);
        }
    }
}
bootstrap();
//# sourceMappingURL=main.js.map