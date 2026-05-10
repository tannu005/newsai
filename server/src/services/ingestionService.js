import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { addDocuments, clearStore } from './vectorStoreService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Ingest the news dataset: load articles, chunk them, generate embeddings,
 * and store in the vector database.
 * @param {boolean} forceReindex - If true, clears existing store before ingesting
 * @returns {Promise<{documentsProcessed: number, chunksCreated: number}>}
 */
export async function ingestDataset(forceReindex = false) {
  console.log('🚀 Starting dataset ingestion...');

  // Always clear existing store before ingesting to prevent duplicates
  await clearStore();

  // Load dataset
  const datasetPath = path.resolve(config.dataPath, 'news_dataset.json');
  const raw = await fs.readFile(datasetPath, 'utf-8');
  const articles = JSON.parse(raw);

  console.log(`📰 Loaded ${articles.length} articles`);

  // Create text splitter for intelligent chunking
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.chunkSize,
    chunkOverlap: config.chunkOverlap,
    separators: ['\n\n', '\n', '. ', ', ', ' ', ''],
  });

  const allDocuments = [];

  for (const article of articles) {
    // Build full text with title for context
    const fullText = `${article.title}\n\n${article.content}`;

    // Split into chunks
    const chunks = await splitter.splitText(fullText);

    // Create LangChain Documents with rich metadata
    for (let i = 0; i < chunks.length; i++) {
      allDocuments.push(
        new Document({
          pageContent: chunks[i],
          metadata: {
            articleId: article.id,
            title: article.title,
            category: article.category,
            source: article.source,
            url: article.url || '',
            publishedAt: article.publishedAt,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        })
      );
    }
  }

  console.log(`✂️ Created ${allDocuments.length} chunks from ${articles.length} articles`);

  // Batch add to vector store (with rate limiting for API)
  const BATCH_SIZE = 50;
  for (let i = 0; i < allDocuments.length; i += BATCH_SIZE) {
    const batch = allDocuments.slice(i, i + BATCH_SIZE);
    await addDocuments(batch);
    console.log(`📊 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allDocuments.length / BATCH_SIZE)}`);

    // Small delay between batches to respect API rate limits
    if (i + BATCH_SIZE < allDocuments.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('✅ Ingestion complete!');

  return {
    documentsProcessed: articles.length,
    chunksCreated: allDocuments.length,
  };
}
