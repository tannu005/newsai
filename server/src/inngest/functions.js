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
    console.log(`🚀 [Inngest] Starting ingestion. Force reindex: ${forceReindex}`);

    if (forceReindex) {
      await step.run("clear-vector-store", async () => {
        console.log("🗑️ [Inngest] Clearing vector store...");
        await clearStore();
        return { status: "cleared" };
      });
    }

    const articles = await step.run("load-dataset", async () => {
      const datasetPath = path.resolve(config.dataPath, 'news_dataset.json');
      console.log(`📖 [Inngest] Loading dataset from ${datasetPath}`);
      const raw = await fs.readFile(datasetPath, 'utf-8');
      const data = JSON.parse(raw);
      console.log(`📰 [Inngest] Loaded ${data.length} articles`);
      return data;
    });

    const allDocuments = await step.run("chunk-articles", async () => {
      console.log("✂️ [Inngest] Chunking articles...");
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
      console.log(`✂️ [Inngest] Created ${docs.length} chunks`);
      return docs;
    });

    // Batch processing with Inngest steps
    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(allDocuments.length / BATCH_SIZE);
    
    for (let i = 0; i < allDocuments.length; i += BATCH_SIZE) {
      const batch = allDocuments.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      await step.run(`process-batch-${batchNum}`, async () => {
        console.log(`📊 [Inngest] Processing batch ${batchNum}/${totalBatches}`);
        // Reconstruct LangChain Documents
        const documents = batch.map(d => new Document(d));
        await addDocuments(documents);
        return { processed: documents.length };
      });
      
      // Optional: Add a small sleep between batches to avoid hitting rate limits
      // await step.sleep("1s");
    }

    console.log("✅ [Inngest] Ingestion complete!");
    return {
      status: "success",
      documentsProcessed: articles.length,
      chunksCreated: allDocuments.length,
    };
  }
);
