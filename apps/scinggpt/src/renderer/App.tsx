import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import VoiceInput from './components/VoiceInput';
import SessionPanel from './components/SessionPanel';
import StatusBar from './components/StatusBar';
import { useSession } from './hooks/useSession';
import { useMCP } from './hooks/useMCP';

function App() {
  const { session, createSession, isLoading: sessionLoading } = useSession();
  const { status: mcpStatus, connect: connectMCP } = useMCP();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Initialize session and MCP connection on mount
    const init = async () => {
      if (!session) {
        await createSession();
      }
      if (!mcpStatus.connected) {
        await connectMCP();
      }
    };
    init();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-scing-dark">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1.5 hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-scing-primary">ScingGPT</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${mcpStatus.connected ? 'bg-scing-success' : 'bg-scing-error'}`} />
          <span className="text-sm text-gray-400">
            {mcpStatus.connected ? `MCP (${mcpStatus.toolCount} tools)` : 'MCP Disconnected'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-gray-800 bg-gray-900/50">
            <SessionPanel />
          </aside>
        )}

        {/* Chat Area */}
        <main className="flex flex-1 flex-col">
          <ChatInterface sessionId={session?.id} />
          <VoiceInput />
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar session={session} mcpStatus={mcpStatus} />
    </div>
  );
}

export default App;
