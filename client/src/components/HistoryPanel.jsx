import React from 'react';
import { MessageSquarePlus, Clock, Cpu, TrendingUp, HeartPulse, Search } from 'lucide-react';

export default function HistoryPanel({ sessions, currentSessionId, onNewChat, onSelectSession, isOpen }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('ai') || t.includes('tech') || t.includes('gpt')) return <Cpu size={14} />;
    if (t.includes('finance') || t.includes('rate') || t.includes('economy') || t.includes('stock')) return <TrendingUp size={14} />;
    if (t.includes('health') || t.includes('medical') || t.includes('virus')) return <HeartPulse size={14} />;
    return <Search size={14} />;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <Clock size={16} color="var(--text-muted)" />
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <MessageSquarePlus size={18} />
        New Chat
      </button>

      <div className="session-list">
        {sessions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No conversations yet. Start chatting!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`session-item ${session.sessionId === currentSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(session.sessionId)}
            >
              <div className="session-item-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="category-icon" style={{ color: 'var(--accent-gold)', opacity: 0.7 }}>
                  {getCategoryIcon(session.title)}
                </span>
                <div className="session-item-title">{session.title}</div>
              </div>
              <div className="session-item-time" style={{ marginLeft: '22px' }}>{formatTime(session.lastMessage)}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

