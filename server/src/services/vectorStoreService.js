import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { getEmbeddings, getQueryEmbeddings } from './embeddingService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let vectorStore = null;
const STORE_FILE = path.join(config.vectorStorePath, 'store.json');

/**
 * Initialize or retrieve the vector store singleton.
 */
export async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const embeddings = getEmbeddings();
  
  try {
    let data;
    try {
      const raw = await fs.readFile(STORE_FILE, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      console.log('Falling back to bundled vector store data...');
      try {
        data = require('../vectorstore/store.json');
      } catch (err) {
        console.warn('No bundled store found.');
      }
    }

    if (data && data.vectors && data.vectors.length > 0) {
      vectorStore = new MemoryVectorStore(embeddings);
      vectorStore.memoryVectors = data.vectors.map((v) => ({
        content: v.content,
        embedding: v.embedding || v.vector || [],
        metadata: v.metadata,
      }));
      console.log(`✅ Successfully loaded ${data.vectors.length} vectors.`);
      return vectorStore;
    }
  } catch (error) {
    console.warn(`⚠️ No persisted vector store found: ${error.message}`);
  }

  console.warn('⚠️ Creating empty vector store.');
  vectorStore = new MemoryVectorStore(embeddings);
  return vectorStore;
}

/**
 * Add documents to the vector store and persist to disk.
 */
export async function addDocuments(documents) {
  const store = await getVectorStore();
  const embeddings = getEmbeddings();

  console.log(`📡 Generating embeddings for ${documents.length} documents...`);
  
  // Manually generate embeddings to bypass any potential issues with MemoryVectorStore's internal calls
  const texts = documents.map(doc => doc.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  if (!vectors || vectors.length === 0 || vectors[0].length === 0) {
    console.error('❌ Failed to generate valid embeddings. Vectors are empty.');
    throw new Error('Embedding generation failed: received empty vectors.');
  }

  // Create the memory vector objects
  const memoryVectors = documents.map((doc, i) => ({
    content: doc.pageContent,
    embedding: vectors[i],
    metadata: doc.metadata,
  }));

  // Add to the in-memory store
  if (!store.memoryVectors) store.memoryVectors = [];
  store.memoryVectors.push(...memoryVectors);
  
  await persistStore();
  console.log(`✅ Successfully added and persisted ${documents.length} documents to vector store`);
}

/**
 * Perform similarity search using query-optimized embeddings.
 */
export async function similaritySearch(query, k = config.topK) {
  const store = await getVectorStore();
  
  // Use query-optimized embeddings for search
  const queryEmbedder = getQueryEmbeddings();
  const queryVector = await queryEmbedder.embedQuery(query);
  
  const results = await store.similaritySearchVectorWithScore(queryVector, k);
  return results.map(([document, score]) => ({ document, score }));
}

/**
 * Check if the vector store has been populated.
 */
export async function isStorePopulated() {
  const store = await getVectorStore();
  return store.memoryVectors && store.memoryVectors.length > 0;
}

/**
 * Get the count of vectors and other stats.
 */
export async function getStoreStats() {
  const store = await getVectorStore();
  const vectorCount = store.memoryVectors ? store.memoryVectors.length : 0;
  
  // Calculate unique articles if possible
  const uniqueArticles = new Set();
  if (store.memoryVectors) {
    store.memoryVectors.forEach(v => {
      if (v.metadata && v.metadata.articleId) {
        uniqueArticles.add(v.metadata.articleId);
      }
    });
  }

  return {
    isPopulated: vectorCount > 0,
    vectorCount,
    articleCount: uniqueArticles.size,
    lastUpdated: vectorStore ? new Date().toISOString() : null // Rough estimate
  };
}

/**
 * Persist the current vector store to disk as JSON.
 */
async function persistStore() {
  if (!vectorStore) return;

  if (process.env.VERCEL) {
    console.log('💾 Skipping vector store persistence (Vercel environment)');
    return;
  }

  try {
    await fs.mkdir(config.vectorStorePath, { recursive: true });

    const data = {
      vectors: vectorStore.memoryVectors.map((v) => ({
        content: v.content,
        embedding: v.embedding || v.vector || [],
        metadata: v.metadata,
      })),
      savedAt: new Date().toISOString(),
    };

    await fs.writeFile(STORE_FILE, JSON.stringify(data), 'utf-8');
    console.log(`💾 Persisted ${data.vectors.length} vectors to disk`);
  } catch (error) {
    console.warn(`⚠️ Failed to persist store: ${error.message}`);
  }
}

/**
 * Clear the vector store.
 */
export async function clearStore() {
  vectorStore = new MemoryVectorStore(getEmbeddings());
  try {
    await fs.unlink(STORE_FILE);
  } catch { }
  console.log('🗑️ Vector store cleared');
}
