import { analyzeResponse } from './src/services/llmService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  const query = "What's happening in the global financial markets?";
  const answer = "The ECB cut rates, the Fed held steady, and Bitcoin hit $100K.";
  const context = "[Article 1: ECB cuts rates... Article 2: Fed holds steady... Article 3: Bitcoin past 100K]";
  
  console.log('Testing Analyze with AI...');
  try {
    const analysis = await analyzeResponse(query, answer, context);
    console.log('--- ANALYSIS RESULT ---');
    console.log(JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.error('Error during test:', error);
  }
}

test();
