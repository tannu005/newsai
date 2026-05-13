import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { getEmbeddings } from './embeddingService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vectorStore = null;
const STORE_FILE = path.join(config.vectorStorePath, 'store.json');

/**
 * Initialize or retrieve the vector store singleton.
 * Attempts to load persisted data from disk on first call.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const embeddings = getEmbeddings();
  
  try {
    let data;
    try {
      // First try to read from disk (for local dev where we might have just ingested)
      const raw = await fs.readFile(STORE_FILE, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      // If disk read fails (like on Vercel), fallback to the bundled require
      // NOTE: The path must be a static string for Vercel's bundler to include the file
      console.log('Falling back to bundled vector store data...');
      data = require('../vectorstore/store.json');
    }

    if (data && data.vectors && data.vectors.length > 0) {
      vectorStore = new MemoryVectorStore(embeddings);
      vectorStore.memoryVectors = data.vectors.map((v) => ({
        content: v.content,
        embedding: v.embedding,
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

  // Skip persistence on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log('💾 Skipping vector store persistence (Vercel environment)');
    return;
  }

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
