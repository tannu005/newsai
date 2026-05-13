import React, { useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

export default function SourceCard({ source, onAnalyze }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`source-card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <div className="source-card-title">{source.title}</div>
      <div className="source-card-meta">
        <span className={`source-badge ${source.category}`} style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-gold)' }}>
          {source.category}
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, flexShrink: 0 }}>{source.source}</span>
        {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="source-link"
              style={{ 
                color: 'var(--accent-gold)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Visit</span>
              <ExternalLink size={12} />
            </a>
        )}
        {onAnalyze && (
          <button
            className="analyze-btn source-analyze-btn"
            onClick={(e) => { e.stopPropagation(); onAnalyze(); }}
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.68rem', 
              background: 'rgba(255, 215, 0, 0.1)', 
              border: '1px solid rgba(255, 215, 0, 0.2)',
              marginLeft: 'auto',
              borderRadius: '12px',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={11} />
            <span>Analyze</span>
          </button>
        )}
      </div>
      {expanded && source.snippet && (
        <div className="source-snippet" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '8px', paddingTop: '8px' }}>
          {source.snippet}
        </div>
      )}
    </div>
  );
}

