const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Request failed');
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export const api = {
  /** Send a chat message and get RAG response */
  chat: (query, sessionId) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ query, sessionId }),
    }),

  /** Request deep analysis of a response */
  analyze: (originalQuery, originalAnswer, context) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ analyze: true, originalQuery, originalAnswer, context }),
    }),

  /** Trigger dataset ingestion */
  ingest: (forceReindex = false) =>
    request('/ingest', {
      method: 'POST',
      body: JSON.stringify({ forceReindex }),
    }),

  /** Get ingestion status */
  ingestStatus: () => request('/ingest/status'),

  /** Get chat history */
  history: (sessionId) =>
    request(`/history${sessionId ? `?sessionId=${sessionId}` : ''}`),

  /** Clear all history */
  clearHistory: () =>
    request('/history', { method: 'DELETE' }),

  /** Delete a specific session */
  deleteSession: (sessionId) =>
    request(`/history/${sessionId}`, { method: 'DELETE' }),

  /** Health check */
  health: () => request('/health'),
};
