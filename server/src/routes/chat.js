import { Router } from 'express';
import { runRAGPipeline, runAnalysisPipeline } from '../services/ragService.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

const router = Router();
const HISTORY_FILE = path.resolve(config.dataPath, 'history.json');

/**
 * POST /api/chat
 * Accepts user query, runs RAG pipeline, returns answer + sources.
 * Also supports "analyze" mode for deep-dive analysis.
 */
router.post('/', async (req, res) => {
  try {
    const { query, sessionId, analyze, originalQuery, originalAnswer, context } = req.body;

    if (!query && !analyze) {
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

    // Save to history
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      sessionId: session,
    };

    const aiMessage = {
      id: messageId,
      role: 'assistant',
      content: result.answer,
      sources: result.sources,
      context: result.context,
      timestamp: new Date().toISOString(),
      sessionId: session,
    };

    await appendToHistory(userMessage);
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
    res.status(500).json({ error: 'Failed to process chat request', details: error.message });
  }
});

async function appendToHistory(message) {
  try {
    let history = [];
    try {
      const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }
    history.push(message);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export default router;
