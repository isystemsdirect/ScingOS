// ScingGPT - Session Hook

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../../shared/types';

interface UseSessionReturn {
  session: Session | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<Session | null>;
  switchSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<boolean>;
  updateSession: (update: Partial<Session>) => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const list = await window.scinggpt.session.list();
      setSessions(list as Session[]);

      // If there are sessions, set the first active one as current
      const activeSession = (list as Session[]).find((s) => s.status === 'active');
      if (activeSession) {
        setSession(activeSession);
      } else if (list.length > 0) {
        setSession(list[0] as Session);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = useCallback(async (): Promise<Session | null> => {
    try {
      setError(null);
      const newSession = await window.scinggpt.session.create();
      const typedSession = newSession as Session;
      setSession(typedSession);
      setSessions((prev) => [typedSession, ...prev]);
      return typedSession;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const switchSession = useCallback(async (id: string): Promise<void> => {
    const targetSession = sessions.find((s) => s.id === id);
    if (targetSession) {
      // Mark previous session as paused
      if (session && session.id !== id) {
        await window.scinggpt.session.update({ ...session, status: 'paused' });
      }
      // Mark new session as active
      await window.scinggpt.session.update({ ...targetSession, status: 'active' });
      setSession({ ...targetSession, status: 'active' });
    }
  }, [session, sessions]);

  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await window.scinggpt.session.delete(id);
      if (success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (session?.id === id) {
          const remaining = sessions.filter((s) => s.id !== id);
          setSession(remaining.length > 0 ? remaining[0] : null);
        }
      }
      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [session, sessions]);

  const updateSession = useCallback(async (update: Partial<Session>): Promise<void> => {
    if (!session) return;
    try {
      await window.scinggpt.session.update({ ...session, ...update });
      setSession((prev) => prev ? { ...prev, ...update } : null);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, ...update } : s))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, [session]);

  return {
    session,
    sessions,
    isLoading,
    error,
    createSession,
    switchSession,
    deleteSession,
    updateSession,
  };
}
