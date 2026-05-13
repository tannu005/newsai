import React from 'react';
import { MessageSquarePlus, Clock, Cpu, TrendingUp, HeartPulse, Search, Trash2, X } from 'lucide-react';

export default function HistoryPanel({ sessions, currentSessionId, onNewChat, onSelectSession, onDeleteSession, onClearHistory, isOpen }) {
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
        {sessions.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 10px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Chats</span>
            <button 
              onClick={() => { if(window.confirm('Clear all chat history?')) onClearHistory(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
              title="Clear All History"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>
        )}
        {sessions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No conversations yet. Start chatting!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`session-item ${session.sessionId === currentSessionId ? 'active' : ''}`}
              style={{ position: 'relative' }}
              onClick={() => onSelectSession(session.sessionId)}
            >
              <div className="session-item-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '24px' }}>
                <span className="category-icon" style={{ color: 'var(--accent-gold)', opacity: 0.7 }}>
                  {getCategoryIcon(session.title)}
                </span>
                <div className="session-item-title">{session.title}</div>
              </div>
              <div className="session-item-time" style={{ marginLeft: '22px' }}>{formatTime(session.lastMessage)}</div>
              
              <button 
                className="delete-session-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if(window.confirm('Delete this session?')) onDeleteSession(session.sessionId);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  padding: '4px'
                }}
                title="Delete Session"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

