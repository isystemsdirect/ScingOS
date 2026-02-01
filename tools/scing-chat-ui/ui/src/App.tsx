import { useEffect, useState } from 'react'
import './App.css'

type Msg = { ts: string; from: string; role: string; topic: string; text: string; tags?: string[] };
type SearchHit = { thread: string; ts: string; from: string; role: string; topic: string; tags?: string[]; preview: string; line: number };

function App() {
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);

  // Quick API connectivity test on mount
  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    if (!base) return;
    fetch(`${base}/api/test`)
      .then(response => response.json())
      .then(data => console.log("API Test Result:", data))
      .catch(error => console.error("API Test Error:", error));
  }, []);

  async function runSearch(query: string) {
    const s = query.trim();
    if (!s) { setHits([]); setSearching(false); return; }
    setSearching(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(s)}&limit=120`);
      const j = await r.json();
      setHits(j.results ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function loadThread(name: string) {
    const r = await fetch(`/api/thread/${encodeURIComponent(name)}`);
    const j = await r.json();
    setMessages(j.messages ?? []);
    setActive(name);
  }

  useEffect(() => {
    const s = searchQ.trim();
    if (!s) { setHits([]); return; }
    const t = setTimeout(() => runSearch(s), 250);
    return () => clearTimeout(t);
  }, [searchQ]);

  return (
    <div className="container" style={{ display: 'flex', gap: 20, padding: 20 }}>
      <div style={{ width: 380 }}>
        <h2>Global Search</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search inside notes…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            style={{ flex: 1, padding: '8px 10px' }}
          />
          <button onClick={() => { setSearchQ(""); setHits([]); }}>Clear</button>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          {searching ? 'searching…' : (hits.length ? `${hits.length} results` : '')}
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: 8, marginTop: 10, maxHeight: 300, overflow: 'auto' }}>
          {hits.length === 0 && !searching && (
            <div style={{ padding: 12, fontSize: 14, opacity: 0.7 }}>No matches.</div>
          )}
          {hits.map((h, idx) => (
            <button
              key={idx}
              onClick={async () => { await loadThread(h.thread); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: 12, borderBottom: '1px solid #eee', background: 'white' }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>{h.thread.replace("thread__", "").replace(".jsonl"," ")} • {h.topic} • {h.from}</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>{h.preview}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Thread Viewer</h2>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{active ? active : 'No thread selected'}</div>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, marginTop: 10, maxHeight: 500, overflow: 'auto' }}>
          {messages.length === 0 && (
            <div style={{ padding: 12, fontSize: 14, opacity: 0.7 }}>No messages.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{m.ts} • {m.from} • {m.role} • {m.topic}</div>
              <div style={{ fontSize: 14, marginTop: 6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
