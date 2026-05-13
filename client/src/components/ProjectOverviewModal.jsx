import React from 'react';
import { X, Cpu, Database, Layout, Search, Layers, Zap } from 'lucide-react';

export default function ProjectOverviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(12px)' }}>
      <div 
        className="modal-container project-overview" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '800px', border: '1px solid var(--accent-gold)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="var(--accent-gold)" />
            <h2 style={{ color: 'var(--accent-gold)' }}>System Architecture & Tech Stack</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
          <div className="tech-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Frontend */}
            <div className="tech-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Layout size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1rem' }}>Frontend Core</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>• <strong>React 18</strong> with Hooks & Functional Components</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Three.js / React Three Fiber</strong> for immersive 3D UI</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Lucide React</strong> for premium iconography</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Vanilla CSS</strong> with custom design tokens</li>
              </ul>
            </div>

            {/* Backend */}
            <div className="tech-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Cpu size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1rem' }}>Backend Engine</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>• <strong>Node.js & Express</strong> RESTful API architecture</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Inngest</strong> for robust background event-driven ingestion</li>
                <li style={{ marginBottom: '8px' }}>• <strong>LangChain</strong> for RAG & Analytical pipelines</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Gemini AI (Flash 2.0)</strong> for LLM and Embeddings</li>
              </ul>
            </div>

            {/* RAG Pipeline */}
            <div className="tech-section" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Search size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1rem' }}>RAG Ingestion Pipeline</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                The system utilizes a custom Retrieval-Augmented Generation pipeline:
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,215,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)', flex: 1 }}>
                  <Zap size={14} color="var(--accent-gold)" style={{ marginBottom: '4px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>1. Load & Chunk</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Articles are recursively split into semantic chunks.</div>
                </div>
                <div style={{ background: 'rgba(255,215,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)', flex: 1 }}>
                  <Layers size={14} color="var(--accent-gold)" style={{ marginBottom: '4px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>2. Embed</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Google's text-embedding-004 generates high-dim vectors.</div>
                </div>
                <div style={{ background: 'rgba(255,215,0,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)', flex: 1 }}>
                  <Database size={14} color="var(--accent-gold)" style={{ marginBottom: '4px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>3. Index & Store</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Vectors are indexed in a local MemoryStore for fast retrieval.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', textAlign: 'right' }}>
           <button 
            className="ingest-btn" 
            onClick={onClose}
            style={{ padding: '8px 24px', background: 'var(--accent-gold)', color: '#000', border: 'none' }}
           >
             Close Overview
           </button>
        </div>
      </div>
    </div>
  );
}
