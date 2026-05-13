import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Lightbulb, BookOpen, Compass, HelpCircle, Sparkles } from 'lucide-react';

const TABS = [
  { key: 'explanation', label: 'Explanation', icon: BookOpen },
  { key: 'keyInsights', label: 'Key Insights', icon: Lightbulb },
  { key: 'simplified', label: 'Simplified', icon: Brain },
  { key: 'additionalContext', label: 'Context', icon: Compass },
  { key: 'followUpQuestions', label: 'Follow-ups', icon: HelpCircle },
];

export default function AnalyzeModal({ isOpen, onClose, analysis, isLoading, onFollowUp }) {
  const [activeTab, setActiveTab] = useState('explanation');

  useEffect(() => {
    if (isOpen) setActiveTab('explanation');
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[100, 95, 88, 70, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: `${w}%`, height: '14px', background: 'var(--bg-elevated)', borderRadius: '4px', opacity: 0.3 }} />
          ))}
        </div>
      );
    }

    if (!analysis) return <p>No analysis available.</p>;

    switch (activeTab) {
      case 'explanation':
        return <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{analysis.explanation}</div>;
      case 'keyInsights':
        return (
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: '12px' }}>Key Insights</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(analysis.keyInsights || []).map((insight, i) => (
                <span key={i} className="insight-chip" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {insight}
                </span>
              ))}
            </div>
          </div>
        );
      case 'simplified':
        return <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{analysis.simplified}</div>;
      case 'additionalContext':
        return <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{analysis.additionalContext}</div>;
      case 'followUpQuestions':
        return (
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: '12px' }}>Suggested Follow-ups</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(analysis.followUpQuestions || []).map((q, i) => (
                <button
                  key={i}
                  className="follow-up-btn"
                  onClick={() => { onFollowUp(q); onClose(); }}
                  style={{ textAlign: 'left', padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ background: 'rgba(5, 11, 26, 0.9)' }}
      >
        <motion.div
          className="modal-container"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Deep Analysis</h2>
            </div>
            <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-tabs" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--glass-border)' }}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`modal-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{ 
                  color: activeTab === key ? 'var(--accent-gold)' : 'var(--text-muted)',
                  borderBottomColor: activeTab === key ? 'var(--accent-gold)' : 'transparent',
                  background: 'transparent',
                  padding: '12px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {label}
              </button>
            ))}
          </div>

          <div className="modal-body" style={{ background: 'var(--bg-primary)', padding: '24px', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

