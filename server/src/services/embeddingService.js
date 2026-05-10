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
    embeddingsInstance = new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
      model: config.embeddingModel,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
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
  });
}
