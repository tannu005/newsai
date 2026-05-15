import { Router } from 'express';
import { isStorePopulated, getStoreStats } from '../services/vectorStoreService.js';
import { ingestDataset, ingestionProgress } from '../services/ingestionService.js';

const router = Router();

import { inngest } from '../inngest/client.js';

/**
 * POST /api/ingest
 * Triggers the dataset ingestion pipeline.
 * Uses Inngest for background processing if available, otherwise runs directly.
 */
router.post('/', async (req, res) => {
  try {
    const forceReindex = req.body.forceReindex || false;

    // Try Inngest first
    try {
      console.log('📡 Sending ingestion event to Inngest...');
      const { ids } = await inngest.send({
        name: "api/news.ingest",
        data: { forceReindex },
      });
      console.log(`✅ Event sent successfully. Event ID: ${ids[0]}`);
      return res.json({
        status: 'success',
        message: 'Ingestion started in the background',
        eventId: ids[0],
      });
    } catch (inngestError) {
      console.warn('⚠️ Inngest failed to send event:', inngestError.message);
      // Fallback to direct ingestion handled below
    }

    // Direct ingestion fallback
    const result = await ingestDataset(forceReindex);
    res.json({
      status: 'success',
      message: 'Ingestion completed',
      ...result,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Failed to start ingestion', details: error.message });
  }
});

/**
 * GET /api/ingest/status
 * Returns current ingestion status and vector store stats.
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await getStoreStats();
    console.log(`🔍 Status Poll: ${ingestionProgress.status} - ${ingestionProgress.percentage}% - ${ingestionProgress.currentStep || 'N/A'}`);
    res.json({
      ...stats,
      progress: ingestionProgress
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
