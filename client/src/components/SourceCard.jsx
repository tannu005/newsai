import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function SourceCard({ source }) {
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
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{source.source}</span>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--accent-gold)', display: 'flex' }}
          >
            <ExternalLink size={12} />
          </a>
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

