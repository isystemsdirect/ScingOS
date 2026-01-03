import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import AppShell from '../../components/layout/AppShell';
import { firebaseConfigured, firestore } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store/authStore';
import { sessionMessagesCollectionRef } from '../../lib/refs';

type SessionDoc = {
  user_id: string;
  title?: string | null;
  started_at?: any;
  last_activity?: any;
};

type MessageDoc = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  created_at?: any;
};

export default function SessionDetail() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const sessionId = typeof router.query.id === 'string' ? router.query.id : null;

  const [session, setSession] = useState<SessionDoc | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canLoad = useMemo(
    () => Boolean(firebaseConfigured && firestore && user && sessionId),
    [firebaseConfigured, user, sessionId]
  );

  useEffect(() => {
    if (!canLoad || !firestore || !user || !sessionId) return;

    let unsubMessages: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      setError(null);

      try {
        const sessionSnap = await getDoc(doc(firestore, 'sessions', sessionId));
        if (!sessionSnap.exists()) {
          setSession(null);
          setMessages([]);
          setError('Session not found.');
          return;
        }

        const data = sessionSnap.data() as any;
        const s = data as SessionDoc;
        if (s.user_id !== user.uid) {
          setSession(null);
          setMessages([]);
          setError('Access denied.');
          return;
        }

        if (cancelled) return;
        setSession(s);

        const q = query(
          sessionMessagesCollectionRef(sessionId),
          orderBy('created_at', 'asc')
        );

        unsubMessages = onSnapshot(
          q,
          (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MessageDoc[];
            setMessages(items);
          },
          (e) => {
            setError(e?.message || 'Failed to load messages.');
          }
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to load session.');
      }
    })();

    return () => {
      cancelled = true;
      if (unsubMessages) unsubMessages();
    };
  }, [canLoad, sessionId, user]);

  const send = useCallback(async () => {
    if (!firestore || !user || !sessionId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setText('');

    try {
      await addDoc(sessionMessagesCollectionRef(sessionId), {
        user_id: user.uid,
        role: 'user',
        text: trimmed,
        created_at: serverTimestamp(),
      });

      await updateDoc(doc(firestore, 'sessions', sessionId), {
        last_activity: serverTimestamp(),
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to send message.');
      setText(trimmed);
    }
  }, [sessionId, text, user]);

  return (
    <AppShell
      title={sessionId ? `Session ${sessionId.slice(0, 8)}` : 'Session'}
      subtitle="Messages (owner-only)."
    >
      {!firebaseConfigured ? (
        <div className="scing-card">
          <div style={{ fontSize: 14, fontWeight: 800 }}>Bootstrap Mode</div>
          <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
            Firebase is not configured.
          </div>
        </div>
      ) : loading ? (
        <div className="scing-card">
          <div className="scing-subtle" style={{ fontSize: 12 }}>Loading…</div>
        </div>
      ) : !user ? (
        <div className="scing-card">
          <div style={{ fontSize: 14, fontWeight: 800 }}>Sign in required</div>
          <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
            Sign in to view this session.
          </div>
        </div>
      ) : !sessionId ? (
        <div className="scing-card">
          <div className="scing-subtle" style={{ fontSize: 12 }}>Missing session id.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {error ? (
            <div className="scing-card" style={{ borderColor: 'rgba(255,46,122,0.35)' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Error</div>
              <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
                {error}
              </div>
            </div>
          ) : null}

          <div className="scing-card">
            <div style={{ fontSize: 12, fontWeight: 800 }}>Transcript</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {messages.length === 0 ? (
                <div className="scing-subtle" style={{ fontSize: 12 }}>No messages yet.</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="scing-surface"
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid var(--stroke)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>{m.role.toUpperCase()}</div>
                      <div className="scing-subtle" style={{ fontSize: 12 }}>
                        {m.id.slice(0, 6)}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 13 }}>{m.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="scing-card">
            <div style={{ fontSize: 12, fontWeight: 800 }}>Send</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="scing-input"
                placeholder="Type a message…"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="scing-btn" onClick={() => router.push('/sessions')}>
                  Back
                </button>
                <button className="scing-btn scing-btn-primary" onClick={send}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
