import { Router } from 'express';
import { isStorePopulated, getVectorCount } from '../services/vectorStoreService.js';
import { ingestDataset } from '../services/ingestionService.js';

const router = Router();

/**
 * POST /api/ingest
 * Triggers the dataset ingestion pipeline.
 * Uses Inngest for background processing if available, otherwise runs directly.
 */
router.post('/', async (req, res) => {
  try {
    const forceReindex = req.body.forceReindex || false;

    // Try Inngest first (if available), otherwise run directly
    if (process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_DEV === '1') {
      try {
        const { inngest } = await import('../inngest/client.js');
        const { ids } = await inngest.send({
          name: "api/news.ingest",
          data: { forceReindex },
        });
        return res.json({
          status: 'success',
          message: 'Ingestion started in the background',
          eventId: ids[0],
        });
      } catch (inngestError) {
        console.warn('Inngest unavailable, falling back to direct ingestion:', inngestError.message);
      }
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
    const populated = await isStorePopulated();
    const vectorCount = await getVectorCount();
    res.json({
      isPopulated: populated,
      vectorCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
