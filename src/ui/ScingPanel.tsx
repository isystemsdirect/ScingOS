import { useEffect, useMemo, useState } from 'react';
import { dispatchAvatarIntent } from '../avatar/intentBridge';
import * as scingPanelStore from './scingPanelStore';

type ChatResponse = { textOut: string };

type PanelModel = {
  isOpen: boolean;
};

export function ScingPanel() {
  const [model, setModel] = useState<PanelModel>({ isOpen: scingPanelStore.getState().isOpen });

  const [text, setText] = useState('');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);

  const identityHeaders = useMemo(() => {
    return {
      'x-bane-identity': 'local-dev',
      'x-bane-capabilities': 'bane:invoke',
    } as const;
  }, []);

  useEffect(() => {
    return scingPanelStore.subscribe((s) => setModel({ isOpen: s.isOpen }));
  }, []);

  useEffect(() => {
    if (!model.isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      scingPanelStore.close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [model.isOpen]);

  const sendText = async (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed) return;

    const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `corr_${Date.now()}`;
    setTranscript((t) => [...t, trimmed]);

    try {
      const res = await fetch('/api/scing/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...identityHeaders,
        },
        body: JSON.stringify({ correlationId, text: trimmed }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || payload?.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as ChatResponse;
      setResponses((r) => [...r, json.textOut]);
    } catch (e: any) {
      setResponses((r) => [...r, e?.message || 'Failed to send.']);
    }
  };

  const onSend = async () => {
    const msg = text;
    setText('');
    await sendText(msg);
  };

  if (!model.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Scing panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 380,
        maxWidth: '92vw',
        background: 'white',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800 }}>Scing</div>
        <button type="button" onClick={() => scingPanelStore.close()} style={{ padding: '6px 10px' }}>
          Close
        </button>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 10, overflow: 'auto' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Transcript</div>
          <div style={{ marginTop: 6, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {transcript.length === 0 ? <span style={{ opacity: 0.6 }}>—</span> : transcript.join('\n')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Response</div>
          <div style={{ marginTop: 6, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {responses.length === 0 ? <span style={{ opacity: 0.6 }}>—</span> : responses[responses.length - 1]}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => dispatchAvatarIntent('status')}
            style={{ padding: '6px 10px' }}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => dispatchAvatarIntent('help')}
            style={{ padding: '6px 10px' }}
          >
            Help
          </button>
          <button
            type="button"
            onClick={() => dispatchAvatarIntent('reset')}
            style={{ padding: '6px 10px' }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'grid', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type…"
          style={{ padding: '10px 12px', border: '1px solid rgba(0,0,0,0.18)', borderRadius: 10 }}
        />
        <button type="button" onClick={onSend} style={{ padding: '10px 12px', borderRadius: 10 }}>
          Send
        </button>
      </div>
    </div>
  );
}
