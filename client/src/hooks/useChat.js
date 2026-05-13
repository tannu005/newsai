import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing chat state and interactions.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('newsai-session-id');
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem('newsai-session-id', id);
    return id;
  });
  const [sessions, setSessions] = useState([]);
  const [ingestionStatus, setIngestionStatus] = useState({ status: 'idle', isPopulated: false });
  const abortRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    loadSessions();
    checkIngestionStatus();
  }, []);

  // Load messages for current session
  useEffect(() => {
    loadSessionMessages(sessionId);
  }, [sessionId]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.history();
      setSessions(data.sessions || []);
    } catch {
      // Silent fail — history not critical
    }
  }, []);

  const loadSessionMessages = useCallback(async (sid) => {
    try {
      const data = await api.history(sid);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // Start fresh
    }
  }, []);

  const checkIngestionStatus = useCallback(async () => {
    try {
      const status = await api.ingestStatus();
      setIngestionStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isLoading) return;

    setError(null);
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.chat(query, sessionId);
      const aiMsg = {
        id: data.messageId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        context: data.context,
        timestamp: new Date().toISOString(),
        originalQuery: query,
      };
      setMessages((prev) => [...prev, aiMsg]);
      loadSessions(); // Refresh sidebar
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, loadSessions]);

  const analyzeMessage = useCallback(async (message) => {
    try {
      const data = await api.analyze(
        message.originalQuery || '',
        message.content,
        message.context || ''
      );
      return data.analysis;
    } catch (err) {
      throw new Error(err.message || 'Analysis failed');
    }
  }, []);

  const startNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    localStorage.setItem('newsai-session-id', newId);
    setSessionId(newId);
    setMessages([]);
    setError(null);
  }, []);

  const switchSession = useCallback((sid) => {
    localStorage.setItem('newsai-session-id', sid);
    setSessionId(sid);
    setMessages([]);
    setError(null);
  }, []);

  const ingestData = useCallback(async () => {
    try {
      setIngestionStatus((prev) => ({ ...prev, status: 'processing' }));
      const result = await api.ingest();
      
      // If it's background ingestion, start polling
      if (result.message && result.message.includes('background')) {
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const status = await checkIngestionStatus();
          if (status?.isPopulated || attempts > 60) {
            clearInterval(interval);
          }
        }, 5000);
      } else {
        setIngestionStatus({
          status: 'complete',
          isPopulated: true,
          vectorCount: result.chunksCreated,
        });
      }
      return result;
    } catch (err) {
      setIngestionStatus((prev) => ({ ...prev, status: 'error' }));
      throw err;
    }
  }, [checkIngestionStatus]);

  const deleteSession = useCallback(async (sid) => {
    try {
      await api.deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sid));
      if (sessionId === sid) {
        startNewChat();
      }
    } catch (err) {
      setError('Failed to delete session: ' + err.message);
    }
  }, [sessionId, startNewChat]);

  const clearAllHistory = useCallback(async () => {
    try {
      await api.clearHistory();
      setSessions([]);
      setMessages([]);
      startNewChat();
    } catch (err) {
      setError('Failed to clear history: ' + err.message);
    }
  }, [startNewChat]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    ingestionStatus,
    sendMessage,
    analyzeMessage,
    startNewChat,
    switchSession,
    deleteSession,
    clearAllHistory,
    ingestData,
    setError,
  };
}
