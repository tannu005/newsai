import { Router } from 'express';
import { inngest } from '../inngest/client.js';
import { isStorePopulated, getVectorCount } from '../services/vectorStoreService.js';

const router = Router();

/**
 * POST /api/ingest
 * Triggers the dataset ingestion pipeline via Inngest.
 */
router.post('/', async (req, res) => {
  try {
    const forceReindex = req.body.forceReindex || false;

    // Send event to Inngest to start background processing
    const { ids } = await inngest.send({
      name: "api/news.ingest",
      data: { forceReindex },
    });

    res.json({
      status: 'success',
      message: 'Ingestion started in the background',
      eventId: ids[0],
    });
  } catch (error) {
    console.error('Ingestion trigger error:', error);
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
