import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  vectorStorePath: process.env.VECTOR_STORE_PATH || path.resolve(__dirname, '../vectorstore'),
  chunkSize: parseInt(process.env.CHUNK_SIZE, 10) || 800,
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP, 10) || 200,
  dataPath: path.resolve(__dirname, '../data'),
  embeddingModel: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
  llmModel: process.env.LLM_MODEL || 'gemini-2.5-flash-preview-05-20',
  topK: 5,
  temperature: 0.3,
};

export default config;
