import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import config from '../config/index.js';

let embeddingsInstance = null;

/**
 * Get or create a singleton instance of the Gemini embedding model.
 * Uses text-embedding-004 optimized for retrieval tasks.
 */
export function getEmbeddings() {
  if (!embeddingsInstance) {
    if (!config.googleApiKey) {
      throw new Error('GOOGLE_API_KEY is not set. Please add it to your .env file.');
    }
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
      model: config.embeddingModel,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      maxRetries: 0,
    });

    // Workaround: Batch embedDocuments returns empty vectors in this environment.
    // We override it to use sequential embedQuery calls which are proven to work.
    const originalEmbedDocuments = embeddings.embedDocuments.bind(embeddings);
    embeddings.embedDocuments = async (texts) => {
      try {
        console.log(`🧪 Attempting batch embedding for ${texts.length} texts...`);
        const results = await originalEmbedDocuments(texts);
        if (results.length > 0 && results[0].length > 0) {
          return results;
        }
        throw new Error('Batch embedding returned empty vectors');
      } catch (err) {
        console.warn('⚠️ Batch embedding failed/empty. Sequential fallback initiated (this may take several minutes due to rate limits)...', err.message);
        const vectors = [];
        const delay = process.env.VERCEL ? 200 : 2000; // Much shorter delay on Vercel to avoid timeouts
        for (const text of texts) {
          const v = await embeddings.embedQuery(text);
          vectors.push(v);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        return vectors;
      }
    };

    embeddingsInstance = embeddings;
    console.log('✅ Embedding instance initialized with robustness workaround (gemini-embedding-001)');
  }
  return embeddingsInstance;
}

/**
 * Get embeddings optimized for query (retrieval query task type).
 */
export function getQueryEmbeddings() {
  if (!config.googleApiKey) {
    throw new Error('GOOGLE_API_KEY is not set. Please add it to your .env file.');
  }
  return new GoogleGenerativeAIEmbeddings({
    apiKey: config.googleApiKey,
    model: config.embeddingModel,
    taskType: TaskType.RETRIEVAL_QUERY,
    maxRetries: 0,
  });
}
