import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import chatRouter from './routes/chat.js';
import ingestRouter from './routes/ingest.js';
import historyRouter from './routes/history.js';
import { getVectorCount } from './services/vectorStoreService.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Only mount Inngest if we have the signing key (production) or are in dev mode
if (process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_DEV === '1') {
  try {
    const { serve } = await import("inngest/express");
    const { inngest } = await import("./inngest/client.js");
    const { ingestNewsDataset } = await import("./inngest/functions.js");
    app.use(
      "/api/inngest",
      serve({ client: inngest, functions: [ingestNewsDataset] })
    );
    console.log('✅ Inngest middleware loaded');
  } catch (error) {
    console.warn('⚠️ Inngest middleware failed to load:', error.message);
  }
}

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/history', historyRouter);

// Health check with diagnostic info
app.get('/api/health', async (req, res) => {
  try {
    const vectorCount = await getVectorCount();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      hasApiKey: !!config.googleApiKey,
      vectorCount: vectorCount,
      env: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
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
