import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import chatRouter from './routes/chat.js';
import ingestRouter from './routes/ingest.js';
import historyRouter from './routes/history.js';

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { ingestNewsDataset } from "./inngest/functions.js";

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Inngest Middleware
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: [ingestNewsDataset] })
);

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server only if not in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
