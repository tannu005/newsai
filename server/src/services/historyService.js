import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import History from '../models/History.js';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_FILE = path.resolve(__dirname, '../../history.json');

// Ephemeral in-memory fallback
let memoryHistory = [];

/**
 * Append a message to history across all available persistence layers.
 */
export async function appendToHistory(message) {
  const msgWithTime = { ...message, timestamp: message.timestamp || new Date().toISOString() };

  // 1. Memory (Always)
  memoryHistory.push(msgWithTime);
  if (memoryHistory.length > 100) memoryHistory.shift();

  // 2. MongoDB
  if (mongoose.connection.readyState === 1) {
    try {
      await History.create(msgWithTime);
    } catch (err) {
      console.error('MongoDB save error:', err);
    }
  }

  // 3. Local Disk (if not serverless)
  if (!process.env.VERCEL) {
    try {
      let history = [];
      try {
        const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
        history = JSON.parse(raw);
      } catch { }
      history.push(msgWithTime);
      await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    } catch (err) {
      console.error('FS save error:', err);
    }
  }
}

/**
 * Retrieve history with fallbacks.
 */
export async function getHistory(sessionId) {
  let history = [];

  // 1. Try MongoDB
  if (mongoose.connection.readyState === 1) {
    try {
      history = await History.find().lean();
    } catch (err) {
      console.error('MongoDB read error:', err);
    }
  }

  // 2. Fallback to Disk
  if (history.length === 0 && !process.env.VERCEL) {
    try {
      const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
      history = JSON.parse(raw);
    } catch { }
  }

  // 3. Fallback to Memory
  if (history.length === 0) {
    history = [...memoryHistory];
  }

  if (sessionId) {
    return history.filter(m => m.sessionId === sessionId);
  }

  return history;
}

/**
 * Clear all history.
 */
export async function clearHistory() {
  memoryHistory = [];
  if (mongoose.connection.readyState === 1) {
    await History.deleteMany({});
  }
  if (!process.env.VERCEL) {
    await fs.writeFile(HISTORY_FILE, '[]', 'utf-8');
  }
}

/**
 * Delete a specific session's history.
 */
export async function deleteSession(sessionId) {
  if (!sessionId) return;

  // 1. Memory
  memoryHistory = memoryHistory.filter(m => m.sessionId !== sessionId);

  // 2. MongoDB
  if (mongoose.connection.readyState === 1) {
    try {
      await History.deleteMany({ sessionId });
    } catch (err) {
      console.error('MongoDB delete error:', err);
    }
  }

  // 3. Local Disk
  if (!process.env.VERCEL) {
    try {
      let history = [];
      try {
        const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
        history = JSON.parse(raw);
      } catch { }
      
      const filtered = history.filter(m => m.sessionId !== sessionId);
      await fs.writeFile(HISTORY_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (err) {
      console.error('FS delete error:', err);
    }
  }
}
