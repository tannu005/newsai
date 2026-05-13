import { Router } from 'express';
import { runRAGPipeline, runAnalysisPipeline } from '../services/ragService.js';
import { v4 as uuidv4 } from 'uuid';
import { appendToHistory } from '../services/historyService.js';
import config from '../config/index.js';

const router = Router();

/**
 * POST /api/chat
 * Accepts user query, runs RAG pipeline, returns answer + sources.
 * Also supports "analyze" mode for deep-dive analysis.
 */
router.post('/', async (req, res) => {
  try {
    const { query, sessionId, analyze, originalQuery, originalAnswer, context } = req.body;

    if (!analyze && !query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Handle "Analyze with AI" requests
    if (analyze) {
      const analysis = await runAnalysisPipeline(
        originalQuery || '',
        originalAnswer || '',
        context || ''
      );
      return res.json({ analysis });
    }

    // Run RAG pipeline
    const result = await runRAGPipeline(query);
    const messageId = uuidv4();
    const session = sessionId || uuidv4();

    // Save user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      sessionId: session,
    };
    await appendToHistory(userMessage);

    // Save AI message
    const aiMessage = {
      id: messageId,
      role: 'assistant',
      content: result.answer,
      sources: result.sources,
      context: result.context,
      timestamp: new Date().toISOString(),
      sessionId: session,
    };
    await appendToHistory(aiMessage);

    res.json({
      answer: result.answer,
      sources: result.sources,
      context: result.context,
      messageId,
      sessionId: session,
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    // Attempt to save the user message even on failure if we have a query
    try {
      const { query, sessionId } = req.body;
      if (query) {
        await appendToHistory({
          id: uuidv4(),
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
          sessionId: sessionId || 'failed-session',
        });
      }
    } catch (hErr) {
      console.error('Failed to save user message during error handling:', hErr);
    }

    res.status(500).json({ error: 'Failed to process chat request', details: error.message });
  }
});

export default router;
