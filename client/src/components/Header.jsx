import React from 'react';
import { Database, Menu, Zap } from 'lucide-react';
import Logo from './Logo';

export default function Header({ ingestionStatus, onIngest, onMenuToggle, onShowOverview }) {
  const isProcessing = ingestionStatus.status === 'processing';
  const isReady = ingestionStatus.isPopulated;

  return (
    <header className="header" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="header-brand">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className="header-logo" style={{ background: 'transparent', padding: 0 }}>
          <Logo size={32} />
        </div>
        <div>
          <div className="header-title" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.02em' }}>NewsAI</div>
          <div className="header-subtitle">
            Intelligent News Analysis • RAG-Powered
            <button 
              onClick={onShowOverview}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--accent-gold)', 
                marginLeft: '8px', 
                cursor: 'pointer',
                fontSize: '0.7rem',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              How it works
            </button>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '6px 12px', 
          borderRadius: '20px', 
          border: '1px solid var(--accent-gold)', 
          background: 'rgba(255, 215, 0, 0.05)',
          marginRight: '12px'
        }}>
          <span className={`status-dot ${isReady ? 'ready' : isProcessing ? 'processing' : 'idle'}`} style={{ 
            backgroundColor: isReady ? 'var(--accent-gold)' : isProcessing ? 'var(--accent-amber)' : 'var(--text-muted)' 
          }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            {isReady
              ? `${ingestionStatus.vectorCount || '✓'} vectors${ingestionStatus.articleCount ? ` • ${ingestionStatus.articleCount} articles` : ''}`
              : isProcessing
              ? 'Processing...'
              : 'Not indexed'}
          </span>
        </div>
        <button
          className="ingest-btn"
          onClick={onIngest}
          disabled={isProcessing}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'var(--gradient-primary)', 
            border: 'none',
            color: '#000',
            borderRadius: '20px',
            fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)'
          }}
        >
          {isProcessing ? (
            <Zap size={14} className="animate-pulse" />
          ) : (
            <Database size={14} />
          )}
          {isProcessing ? 'Processing...' : 'Ingest Data'}
        </button>
      </div>
    </header>
  );
}


