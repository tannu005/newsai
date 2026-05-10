import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

const router = Router();
const HISTORY_FILE = path.resolve(config.dataPath, 'history.json');

/**
 * GET /api/history
 * Fetches chat history, optionally filtered by sessionId.
 */
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    let history = [];

    try {
      const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(raw);
    } catch {
      // No history file yet
    }

    if (sessionId) {
      history = history.filter((msg) => msg.sessionId === sessionId);
    }

    // Group messages by session for the history panel
    const sessions = {};
    for (const msg of history) {
      const sid = msg.sessionId || 'default';
      if (!sessions[sid]) {
        sessions[sid] = {
          sessionId: sid,
          messages: [],
          firstMessage: msg.timestamp,
          lastMessage: msg.timestamp,
        };
      }
      sessions[sid].messages.push(msg);
      sessions[sid].lastMessage = msg.timestamp;
    }

    // Get the first user message as session title
    for (const session of Object.values(sessions)) {
      const firstUserMsg = session.messages.find((m) => m.role === 'user');
      session.title = firstUserMsg
        ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
        : 'New Chat';
    }

    res.json({
      messages: sessionId ? history : undefined,
      sessions: Object.values(sessions).sort(
        (a, b) => new Date(b.lastMessage) - new Date(a.lastMessage)
      ),
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * DELETE /api/history
 * Clears all chat history.
 */
router.delete('/', async (req, res) => {
  try {
    await fs.writeFile(HISTORY_FILE, '[]', 'utf-8');
    res.json({ status: 'cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;
