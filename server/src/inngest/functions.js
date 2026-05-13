import { inngest } from "./client.js";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { addDocuments, clearStore } from '../services/vectorStoreService.js';
import config from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';
import { ingestionProgress } from '../services/ingestionService.js';

export const ingestNewsDataset = inngest.createFunction(
  { id: "ingest-news-dataset", triggers: [{ event: "api/news.ingest" }] },
  async ({ event, step }) => {
    const { forceReindex } = event.data;
    try {
      console.log(`🚀 [Inngest] Starting ingestion. Force reindex: ${forceReindex}`);
    
    // Reset progress
    ingestionProgress.status = 'processing';
    ingestionProgress.percentage = 0;
    ingestionProgress.currentStep = 'Initializing...';
    ingestionProgress.error = null;

    if (forceReindex) {
      await step.run("clear-vector-store", async () => {
        console.log("🗑️ [Inngest] Clearing vector store...");
        ingestionProgress.currentStep = 'Clearing existing index...';
        await clearStore();
        return { status: "cleared" };
      });
    }

    const articles = await step.run("load-dataset", async () => {
      ingestionProgress.currentStep = 'Loading news articles...';
      ingestionProgress.percentage = 5;
      const datasetPath = path.resolve(config.dataPath, 'news_dataset.json');
      console.log(`📖 [Inngest] Loading dataset from ${datasetPath}`);
      const raw = await fs.readFile(datasetPath, 'utf-8');
      const data = JSON.parse(raw);
      console.log(`📰 [Inngest] Loaded ${data.length} articles`);
      return data;
    });

    const allDocuments = await step.run("chunk-articles", async () => {
      console.log("✂️ [Inngest] Chunking articles...");
      ingestionProgress.currentStep = 'Chunking articles into documents...';
      ingestionProgress.percentage = 15;
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
        ingestionProgress.currentStep = `Vectorizing batch ${batchNum} of ${totalBatches}...`;
        ingestionProgress.percentage = Math.round(15 + (batchNum / totalBatches) * 80);
        
        // Reconstruct LangChain Documents
        const documents = batch.map(d => new Document(d));
        await addDocuments(documents);
        return { processed: documents.length };
      });
    }

    ingestionProgress.status = 'completed';
    ingestionProgress.percentage = 100;
    ingestionProgress.currentStep = 'Dataset successfully indexed!';

    console.log("✅ [Inngest] Ingestion complete!");
    return {
      status: "success",
      documentsProcessed: articles.length,
      chunksCreated: allDocuments.length,
    };
  } catch (error) {
    console.error("❌ [Inngest] Ingestion failed:", error);
    ingestionProgress.status = 'error';
    ingestionProgress.error = error.message;
    throw error; // Rethrow for Inngest retries
  }
}
);
