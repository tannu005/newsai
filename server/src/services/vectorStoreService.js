import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { getEmbeddings } from './embeddingService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

let vectorStore = null;
const STORE_FILE = path.join(process.cwd(), 'src/vectorstore/store.json');

/**
 * Initialize or retrieve the vector store singleton.
 * Attempts to load persisted data from disk on first call.
 */
export async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const embeddings = getEmbeddings();
  console.log(`🔍 Attempting to load vector store from: ${STORE_FILE}`);

  // Try loading persisted store
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const data = JSON.parse(raw);

    if (data.vectors && data.vectors.length > 0) {
      vectorStore = new MemoryVectorStore(embeddings);
      vectorStore.memoryVectors = data.vectors.map((v) => ({
        content: v.content,
        embedding: v.embedding,
        metadata: v.metadata,
      }));
      console.log(`✅ Loaded ${data.vectors.length} vectors from disk`);
      return vectorStore;
    }
  } catch (error) {
    console.warn(`⚠️ Could not load persisted store: ${error.message}`);
    // Check if we can find it in another path (Vercel specific)
    try {
      const fallbackPath = path.join(process.cwd(), 'server/src/vectorstore/store.json');
      console.log(`🔍 Trying fallback path: ${fallbackPath}`);
      const raw = await fs.readFile(fallbackPath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.vectors && data.vectors.length > 0) {
        vectorStore = new MemoryVectorStore(embeddings);
        vectorStore.memoryVectors = data.vectors.map((v) => ({
          content: v.content,
          embedding: v.embedding,
          metadata: v.metadata,
        }));
        console.log(`✅ Loaded ${data.vectors.length} vectors from fallback disk`);
        return vectorStore;
      }
    } catch (e) {
      console.warn(`⚠️ Fallback path also failed: ${e.message}`);
    }
  }

  vectorStore = new MemoryVectorStore(embeddings);
  console.log('📦 Created new empty vector store');
  return vectorStore;
}

/**
 * Add documents to the vector store and persist to disk.
 * @param {import('@langchain/core/documents').Document[]} documents
 */
export async function addDocuments(documents) {
  const store = await getVectorStore();
  await store.addDocuments(documents);
  await persistStore();
  console.log(`✅ Added ${documents.length} documents to vector store`);
}

/**
 * Perform similarity search and return top-K results with scores.
 * @param {string} query
 * @param {number} k
 * @returns {Promise<Array<{document: import('@langchain/core/documents').Document, score: number}>>}
 */
export async function similaritySearch(query, k = config.topK) {
  const store = await getVectorStore();
  const results = await store.similaritySearchWithScore(query, k);
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
 * Get the count of vectors in the store.
 */
export async function getVectorCount() {
  const store = await getVectorStore();
  return store.memoryVectors ? store.memoryVectors.length : 0;
}

/**
 * Persist the current vector store to disk as JSON.
 */
async function persistStore() {
  if (!vectorStore) return;

  try {
    // Ensure directory exists
    await fs.mkdir(config.vectorStorePath, { recursive: true });

    const data = {
      vectors: vectorStore.memoryVectors.map((v) => ({
        content: v.content,
        embedding: v.embedding,
        metadata: v.metadata,
      })),
      savedAt: new Date().toISOString(),
    };

    await fs.writeFile(STORE_FILE, JSON.stringify(data), 'utf-8');
    console.log(`💾 Persisted ${data.vectors.length} vectors to disk`);
  } catch (error) {
    console.warn(`⚠️ Failed to persist store (expected on read-only environments): ${error.message}`);
  }
}

/**
 * Clear the vector store and remove persisted data.
 */
export async function clearStore() {
  vectorStore = new MemoryVectorStore(getEmbeddings());
  try {
    await fs.unlink(STORE_FILE);
  } catch {
    // File may not exist
  }
  console.log('🗑️ Vector store cleared');
}
