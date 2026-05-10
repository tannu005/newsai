import { ingestDataset } from './src/services/ingestionService.js';
import { runRAGPipeline } from './src/services/ragService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('--- RE-INGESTING DATASET ---');
  await ingestDataset(true);
  
  const query = "What's happening in the global financial markets?";
  console.log(`\nQuery: ${query}`);
  
  try {
    const result = await runRAGPipeline(query);
    console.log('\n--- RETRIEVED SOURCES ---');
    result.sources.forEach(s => console.log(`- ${s.title} (${s.relevanceScore})`));
    
    console.log('\n--- LLM ANSWER ---');
    console.log(result.answer);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

run();
