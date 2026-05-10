import { Router } from 'express';
import { ingestDataset } from '../services/ingestionService.js';
import { isStorePopulated, getVectorCount } from '../services/vectorStoreService.js';

const router = Router();

let ingestionStatus = { status: 'idle', progress: null };

/**
 * POST /api/ingest
 * Triggers the dataset ingestion pipeline.
 */
router.post('/', async (req, res) => {
  try {
    if (ingestionStatus.status === 'processing') {
      return res.status(409).json({ error: 'Ingestion already in progress' });
    }

    ingestionStatus = { status: 'processing', startedAt: new Date().toISOString() };

    const forceReindex = req.body.forceReindex || false;
    const result = await ingestDataset(forceReindex);

    ingestionStatus = {
      status: 'complete',
      ...result,
      completedAt: new Date().toISOString(),
    };

    res.json({
      status: 'success',
      documentsProcessed: result.documentsProcessed,
      chunksCreated: result.chunksCreated,
    });
  } catch (error) {
    ingestionStatus = { status: 'error', error: error.message };
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Ingestion failed', details: error.message });
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
      ...ingestionStatus,
      isPopulated: populated,
      vectorCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
