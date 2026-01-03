import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import AppShell from '../../components/layout/AppShell';
import { firebaseConfigured, firestore } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store/authStore';
import { sessionsCollectionRef } from '../../lib/refs';

type SessionDoc = {
  id: string;
  user_id: string;
  title?: string | null;
  started_at?: any;
  last_activity?: any;
};

export default function Sessions() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canQuery = useMemo(() => Boolean(firebaseConfigured && firestore && user), [firebaseConfigured, user]);

  const refresh = useCallback(async () => {
    if (!canQuery || !firestore || !user) return;
    setLoadingSessions(true);
    setError(null);
    try {
      const q = query(
        sessionsCollectionRef(),
        where('user_id', '==', user.uid),
        orderBy('last_activity', 'desc'),
        limit(25)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as SessionDoc[];
      setSessions(items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load sessions.');
    } finally {
      setLoadingSessions(false);
    }
  }, [canQuery, user]);

  useEffect(() => {
    if (canQuery) refresh();
  }, [canQuery, refresh]);

  const createSession = useCallback(async () => {
    if (!firestore || !user) return;
    setError(null);
    try {
      const docRef = await addDoc(sessionsCollectionRef(), {
        user_id: user.uid,
        title: null,
        started_at: serverTimestamp(),
        last_activity: serverTimestamp(),
      });
      router.push(`/sessions/${docRef.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create session.');
    }
  }, [router, user]);

  return (
    <AppShell title="Sessions" subtitle="Console, transcripts, and message streams.">
      {!firebaseConfigured ? (
        <div className="scing-card">
          <div style={{ fontSize: 14, fontWeight: 800 }}>Bootstrap Mode</div>
          <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
            Firebase is not configured. Configure NEXT_PUBLIC_FIREBASE_* env vars to enable auth + persistence.
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
            <Link href="/auth/signin">Sign in</Link> to view and create sessions.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="scing-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Session Center</div>
              <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
                Your most recent sessions (Firestore).
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="scing-btn" onClick={refresh} disabled={loadingSessions}>
                Refresh
              </button>
              <button className="scing-btn scing-btn-primary" onClick={createSession}>
                New Session
              </button>
            </div>
          </div>

          {error ? (
            <div className="scing-card" style={{ borderColor: 'rgba(255,46,122,0.35)' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Error</div>
              <div className="scing-subtle" style={{ fontSize: 12, marginTop: 6 }}>
                {error}
              </div>
            </div>
          ) : null}

          <div className="scing-card">
            {loadingSessions ? (
              <div className="scing-subtle" style={{ fontSize: 12 }}>Loading sessions…</div>
            ) : sessions.length === 0 ? (
              <div className="scing-subtle" style={{ fontSize: 12 }}>No sessions yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="scing-surface"
                    style={{ padding: 12, borderRadius: 14, border: '1px solid var(--stroke)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {s.title ? s.title : `Session ${s.id.slice(0, 8)}`}
                      </div>
                      <div className="scing-subtle" style={{ fontSize: 12 }}>
                        Open
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
