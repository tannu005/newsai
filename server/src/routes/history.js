import { Router } from 'express';
import { getHistory, clearHistory } from '../services/historyService.js';

const router = Router();

/**
 * GET /api/history
 * Fetches chat history, optionally filtered by sessionId.
 */
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const history = await getHistory(sessionId);

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
      if (new Date(msg.timestamp) > new Date(sessions[sid].lastMessage)) {
        sessions[sid].lastMessage = msg.timestamp;
      }
    }

    // Get the first user message as session title
    for (const session of Object.values(sessions)) {
      const firstUserMsg = session.messages.find((m) => m && m.role === 'user');
      const content = firstUserMsg ? String(firstUserMsg.content || '') : '';
      session.title = content 
        ? content.substring(0, 60) + (content.length > 60 ? '...' : '')
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
    await clearHistory();
    res.json({ status: 'cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;
