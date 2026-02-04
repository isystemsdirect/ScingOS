// ScingGPT - Status Bar Component

import type { Session } from '../../shared/types';

interface StatusBarProps {
  session: Session | null;
  mcpStatus: {
    connected: boolean;
    toolCount: number;
  };
}

export default function StatusBar({ session, mcpStatus }: StatusBarProps) {
  const formatSessionId = (id: string) => id.slice(0, 8);

  return (
    <footer className="flex h-6 items-center justify-between border-t border-gray-800 bg-gray-900/50 px-4 text-xs text-gray-500">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${
                session.status === 'active' ? 'bg-scing-success' : 'bg-scing-warning'
              }`} />
              Session: {formatSessionId(session.id)}
            </span>
            <span>|</span>
            <span>{session.metadata.platform}</span>
          </>
        ) : (
          <span>No active session</span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${
            mcpStatus.connected ? 'bg-scing-success' : 'bg-scing-error'
          }`} />
          MCP: {mcpStatus.connected ? `${mcpStatus.toolCount} tools` : 'offline'}
        </span>
        <span>|</span>
        <span>ScingGPT v0.1.0</span>
      </div>
    </footer>
  );
}
