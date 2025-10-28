import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Playlist API',
      version: '1.0.0',
      description: 'SE4458 Assignment 2 - in-memory Playlist REST API with Swagger',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' }
    ]
  },
  apis: [resolve(__dirname, './routes/*.js')],
};

export const swaggerSpec = swaggerJSDoc(options);
