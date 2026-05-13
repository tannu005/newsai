import React, { useState, useCallback } from 'react';
import Scene3D from './components/Scene3D';
import Header from './components/Header';
import HistoryPanel from './components/HistoryPanel';
import ChatInterface from './components/ChatInterface';
import { useChat } from './hooks/useChat';
import ProjectOverviewModal from './components/ProjectOverviewModal';

export default function App() {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    ingestionStatus,
    sendMessage,
    analyzeMessage,
    startNewChat,
    switchSession,
    deleteSession,
    clearAllHistory,
    ingestData,
    setError,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const handleIngest = useCallback(async () => {
    try {
      await ingestData();
    } catch (err) {
      setError('Ingestion failed: ' + err.message);
    }
  }, [ingestData, setError]);

  const handleSelectSession = useCallback((sid) => {
    switchSession(sid);
    setSidebarOpen(false);
  }, [switchSession]);

  const handleNewChat = useCallback(() => {
    startNewChat();
    setSidebarOpen(false);
  }, [startNewChat]);

  return (
    <>
      <Scene3D isResponding={isLoading} />
      <div className="app-layout">
        <HistoryPanel
          sessions={sessions}
          currentSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={deleteSession}
          onClearHistory={clearAllHistory}
          isOpen={sidebarOpen}
        />

        <main className="main-content">
          <Header
            ingestionStatus={ingestionStatus}
            onIngest={handleIngest}
            onMenuToggle={() => setSidebarOpen((v) => !v)}
            onShowOverview={() => setOverviewOpen(true)}
          />
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSend={sendMessage}
            onAnalyze={analyzeMessage}
            onClearError={() => setError(null)}
          />
        </main>
      </div>
      <ProjectOverviewModal 
        isOpen={overviewOpen} 
        onClose={() => setOverviewOpen(false)} 
      />
    </>
  );
}
