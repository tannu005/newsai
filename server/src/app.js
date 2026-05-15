import express from 'express';
import cors from 'cors';
import * as mongoose from 'mongoose';
import config from './config/index.js';
import connectDB from './config/db.js';
import chatRouter from './routes/chat.js';
import ingestRouter from './routes/ingest.js';
import historyRouter from './routes/history.js';
import { getStoreStats } from './services/vectorStoreService.js';

// Connect to Database - handle errors gracefully to prevent initialization crash
connectDB().catch(err => console.error('🔴 DB Connection Error:', err.message));

const app = express();

// Global Error Handling for the process
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});

// Body parsing middleware must be registered BEFORE Inngest so Inngest can read the request body
app.use(express.json({ limit: '10mb' }));

// Only mount Inngest if we have the signing key (production) or are in dev mode
if (process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_DEV === '1') {
  try {
    console.log('📡 Initializing Inngest middleware...');
    const { serve } = await import("inngest/express");
    const { inngest } = await import("./inngest/client.js");
    const { ingestNewsDataset } = await import("./inngest/functions.js");
    
    app.use(
      "/api/inngest",
      serve({ 
        client: inngest, 
        functions: [ingestNewsDataset],
        servePath: "/api/inngest",
        signingKey: process.env.INNGEST_SIGNING_KEY || undefined
      })
    );
    console.log('✅ Inngest middleware registered at /api/inngest');
  } catch (error) {
    console.warn('⚠️ Inngest middleware failed to load:', error.message);
  }
}


// Other Middleware
app.use(cors({ origin: true, credentials: true }));

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/history', historyRouter);

// Health check with diagnostic info
app.get('/api/health', async (req, res) => {
  try {
    const stats = await getStoreStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      vectorStore: {
        populated: stats.isPopulated,
        vectors: stats.vectorCount,
        articles: stats.articleCount,
        lastUpdated: stats.lastUpdated
      },
      config: {
        embeddingModel: config.embeddingModel,
        llmModel: config.llmModel,
        hasApiKey: !!config.googleApiKey
      },
      environment: {
        platform: process.env.VERCEL ? 'Vercel' : 'Local',
        inngest: !!(process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_DEV === '1')
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'degraded', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server only when running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`\n🚀 NewsAI Server running on http://localhost:${config.port}`);
    console.log(`📡 API endpoints:`);
    console.log(`   POST /api/chat     → Chat with the news dataset`);
    console.log(`   POST /api/ingest   → Ingest news articles`);
    console.log(`   GET  /api/history  → Fetch chat history`);
    console.log(`   GET  /api/health   → Health check\n`);

    if (!config.googleApiKey) {
      console.warn('⚠️  GOOGLE_API_KEY not set! Copy .env.example to .env and add your key.\n');
    }
  });
}

export default app;
