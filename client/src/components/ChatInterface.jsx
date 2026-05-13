import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, AlertCircle, RefreshCw, User, Bot, Copy, Check } from 'lucide-react';
import SourceCard from './SourceCard';
import AnalyzeModal from './AnalyzeModal';

const SUGGESTED_QUESTIONS = [
  "What's the status of the NASA Artemis III mission?",
  "Tell me about the breakthrough Alzheimer's drug ALZ-4010",
  "How does IBM's Condor quantum processor differ from Osprey?",
  "Summarize the key agreements reached at the COP29 summit",
];

export default function ChatInterface({ messages, isLoading, error, onSend, onAnalyze, onClearError }) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [analyzeModal, setAnalyzeModal] = useState({ open: false, loading: false, analysis: null });
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAnalyze = useCallback(async (message) => {
    setAnalyzeModal({ open: true, loading: true, analysis: null });
    try {
      const analysis = await onAnalyze(message);
      setAnalyzeModal({ open: true, loading: false, analysis });
    } catch {
      setAnalyzeModal({ open: true, loading: false, analysis: { explanation: 'Analysis failed. Please try again.' } });
    }
  }, [onAnalyze]);

  const handleFollowUp = useCallback((question) => {
    setInput(question);
    setTimeout(() => {
      onSend(question);
      setInput('');
    }, 100);
  }, [onSend]);

  const handleSuggested = (q) => {
    onSend(q);
  };

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <>
      {/* Chat Messages */}
      <div className="chat-area">
        {messages.length === 0 && !isLoading ? (
          <div className="chat-empty">
            <div className="chat-empty-icon" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
              <Bot size={40} color="var(--accent-gold)" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', color: 'var(--accent-gold)' }}>NewsAI Premium Dashboard</h2>
            <p style={{ fontSize: '1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 20px' }}>
              An advanced RAG (Retrieval-Augmented Generation) platform for intelligent news synthesis. 
              Grounded in a curated dataset and powered by Gemini 2.0 Flash.
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '32px', 
              flexWrap: 'wrap', 
              justifyContent: 'center' 
            }}>
              <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Gemini 2.0 Flash</span>
              <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Inngest Pipelines</span>
              <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Vector RAG</span>
              <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Three.js UI</span>
            </div>

            <div className="suggested-questions">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} className="suggested-btn" onClick={() => handleSuggested(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.role}`}>
                <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div style={{ flex: 1, maxWidth: 'calc(100% - 48px)' }}>
                  <div className="message-content">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Source cards for AI messages */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-container">
                      {msg.sources.map((src, i) => (
                        <SourceCard 
                          key={i} 
                          source={src} 
                          onAnalyze={() => handleAnalyze({ 
                            originalQuery: msg.originalQuery || 'Deep Analysis', 
                            content: src.snippet, 
                            context: src.snippet 
                          })}
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions for AI messages */}
                  {msg.role === 'assistant' && msg.content && (
                    <div className="message-actions">
                      <button 
                        className="analyze-btn" 
                        onClick={() => handleAnalyze(msg)}
                        title="Deep Analysis"
                      >
                        <Sparkles size={13} />
                        Analyze with AI
                      </button>
                      <button 
                        className="analyze-btn" 
                        onClick={() => handleCopy(msg.content, msg.id)}
                        title="Copy to clipboard"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {copiedId === msg.id ? <Check size={13} color="var(--accent-gold)" /> : <Copy size={13} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="message-row assistant">
                <div className="message-avatar ai-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot" style={{ background: 'var(--accent-amber)' }} />
                    <div className="typing-dot" style={{ background: 'var(--accent-amber)' }} />
                    <div className="typing-dot" style={{ background: 'var(--accent-amber)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="message-row assistant">
                <div className="message-avatar" style={{ background: 'var(--accent-rose)', color: 'white' }}>
                  <AlertCircle size={18} />
                </div>
                <div className="message-content" style={{ borderColor: 'var(--accent-rose)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <p style={{ color: 'var(--accent-rose)', marginBottom: 8, fontWeight: 500 }}>{error}</p>
                  <button
                    className="analyze-btn"
                    style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                    onClick={onClearError}
                  >
                    <RefreshCw size={13} /> Dismiss Error
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <form className="input-wrapper" onSubmit={handleSubmit} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            placeholder="Type your question about current news..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            id="chat-input"
          />
          <button
            className="send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            id="send-button"
            style={{ borderRadius: 'var(--radius-md)', background: 'var(--accent-gold)', color: '#000' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Analyze Modal */}
      <AnalyzeModal
        isOpen={analyzeModal.open}
        onClose={() => setAnalyzeModal({ open: false, loading: false, analysis: null })}
        analysis={analyzeModal.analysis}
        isLoading={analyzeModal.loading}
        onFollowUp={handleFollowUp}
      />
    </>
  );
}

