import { useEffect, useState } from 'react';
import { dispatchAvatarIntent } from '../avatar/intentBridge';
import * as scingPanelStore from './scingPanelStore';
import {
  getConversationState,
  subscribeConversation,
  setConversationAssistantText,
  setConversationError,
  setConversationUserText,
} from './scingConversationStore';
import { NeuralIngressError, submitTextToScing } from '../neural/runtime/neuralIngress';
import { getSrtFeedbackState, subscribeSrtFeedback } from '../srt/feedback/srtFeedbackStore';

type PanelModel = {
  isOpen: boolean;
};

export function ScingPanel() {
  const [model, setModel] = useState<PanelModel>({ isOpen: scingPanelStore.getState().isOpen });

  const [text, setText] = useState('');
  const [conv, setConv] = useState(getConversationState());
  const [srt, setSrt] = useState(getSrtFeedbackState());

  useEffect(() => {
    return scingPanelStore.subscribe((s) => setModel({ isOpen: s.isOpen }));
  }, []);

  useEffect(() => {
    return subscribeConversation(setConv);
  }, []);

  useEffect(() => {
    return subscribeSrtFeedback(setSrt);
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

    setConversationUserText(trimmed);
    try {
      const res = await submitTextToScing(trimmed);
      setConversationAssistantText(res.textOut, res.correlationId);
    } catch (e: any) {
      const msg = e?.message || 'Failed to send.';
      const correlationId = e instanceof NeuralIngressError ? e.correlationId : undefined;
      setConversationError({ message: msg, correlationId });
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
          <div style={{ fontSize: 12, fontWeight: 800 }}>SRT</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            <div>truth: {srt.truth}</div>
            <div style={{ opacity: 0.7 }}>corr: {srt.lastCorrelationId ?? conv.lastCorrelationId ?? '—'}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Transcript</div>
          <div style={{ marginTop: 6, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {conv.lastUserText ? conv.lastUserText : <span style={{ opacity: 0.6 }}>—</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Response</div>
          <div style={{ marginTop: 6, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {conv.error ? (
              <span style={{ fontWeight: 700 }}>{conv.error.message}</span>
            ) : conv.lastAssistantText ? (
              conv.lastAssistantText
            ) : (
              <span style={{ opacity: 0.6 }}>—</span>
            )}
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
