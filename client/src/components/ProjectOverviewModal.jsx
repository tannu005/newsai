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
            <h2 style={{ color: 'var(--accent-gold)' }}>System Implementation • Developed by Tannu Yadav</h2>
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

            {/* Implementation Strategy */}
            <div className="tech-section" style={{ gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>Step-by-Step Implementation</h3>
              <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '6px' }}><strong>Data Pipeline Setup:</strong> Built an event-driven ingestion system using Inngest to handle long-running indexing tasks without blocking the UI.</li>
                <li style={{ marginBottom: '6px' }}><strong>Quota Resilience:</strong> Implemented a "Sequential Fallback" strategy with specific delays (2-4s) to bypass Gemini API Free Tier rate limits (1000 req/day).</li>
                <li style={{ marginBottom: '6px' }}><strong>RAG Orchestration:</strong> Used LangChain to connect Gemini 2.5 Flash Lite with a local vector index, ensuring AI responses are grounded in the curated news dataset.</li>
                <li style={{ marginBottom: '6px' }}><strong>Analytical Layer:</strong> Developed a dedicated "AI Analyzer" pipeline that extracts key insights, executive summaries, and follow-up questions from retrieved news chunks.</li>
              </ol>
            </div>

            {/* Next Steps */}
            <div className="tech-section" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>Next Steps / Roadmap</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>Pinecone Cloud Indexing</span>
                <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>Real-time Web Scraping</span>
                <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>Multi-modal (Images/PDFs)</span>
                <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem' }}>Response Streaming</span>
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
