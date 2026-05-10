import { inngest } from "./client.js";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { addDocuments, clearStore } from '../services/vectorStoreService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

export const ingestNewsDataset = inngest.createFunction(
  { id: "ingest-news-dataset", triggers: [{ event: "api/news.ingest" }] },
  async ({ event, step }) => {
    const { forceReindex } = event.data;

    await step.run("clear-vector-store", async () => {
      await clearStore();
      return { status: "cleared" };
    });

    const articles = await step.run("load-dataset", async () => {
      const datasetPath = path.resolve(config.dataPath, 'news_dataset.json');
      const raw = await fs.readFile(datasetPath, 'utf-8');
      return JSON.parse(raw);
    });

    const allDocuments = await step.run("chunk-articles", async () => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: config.chunkSize,
        chunkOverlap: config.chunkOverlap,
        separators: ['\n\n', '\n', '. ', ', ', ' ', ''],
      });

      const docs = [];
      for (const article of articles) {
        const fullText = `${article.title}\n\n${article.content}`;
        const chunks = await splitter.splitText(fullText);
        
        for (let i = 0; i < chunks.length; i++) {
          docs.push({
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
          });
        }
      }
      return docs;
    });

    // Batch processing with Inngest steps
    const BATCH_SIZE = 50;
    for (let i = 0; i < allDocuments.length; i += BATCH_SIZE) {
      const batch = allDocuments.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      await step.run(`process-batch-${batchNum}`, async () => {
        // Reconstruct LangChain Documents
        const documents = batch.map(d => new Document(d));
        await addDocuments(documents);
        return { processed: documents.length };
      });
      
      // We don't need a manual sleep here as Inngest handles concurrency/rate limiting better
      // but we could use step.sleep if needed.
    }

    return {
      status: "success",
      documentsProcessed: articles.length,
      chunksCreated: allDocuments.length,
    };
  }
);
