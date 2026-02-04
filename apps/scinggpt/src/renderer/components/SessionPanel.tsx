// ScingGPT - Session Panel Component

import { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import type { Session } from '../../shared/types';

export default function SessionPanel() {
  const { session, sessions, createSession, switchSession, deleteSession, isLoading } = useSession();
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const handleNewSession = async () => {
    await createSession();
    setShowNewSessionModal(false);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this session? This cannot be undone.')) {
      await deleteSession(id);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'active': return 'bg-scing-success';
      case 'paused': return 'bg-scing-warning';
      case 'completed': return 'bg-gray-500';
      case 'expired': return 'bg-scing-error';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <h2 className="font-semibold text-gray-200">Sessions</h2>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          aria-label="New session"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-scing-primary border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No sessions yet.
            <br />
            <button
              onClick={handleNewSession}
              className="mt-2 text-scing-primary hover:underline"
            >
              Create your first session
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => switchSession(s.id)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    session?.id === s.id
                      ? 'bg-scing-primary/20 text-scing-primary'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(s.status)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      Session {s.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(s.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="rounded p-1 opacity-0 hover:bg-gray-700 group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card w-80 max-w-[90vw]">
            <h3 className="mb-4 text-lg font-semibold">New Session</h3>
            <p className="mb-4 text-sm text-gray-400">
              Start a fresh conversation. Your previous sessions will be saved.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleNewSession}
                className="btn-primary flex-1"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
